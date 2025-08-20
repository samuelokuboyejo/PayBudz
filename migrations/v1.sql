-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency VARCHAR(3) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TYPE transaction_status AS ENUM ('PENDING','SUCCESSFUL','FAILED');

CREATE TYPE transaction_type AS ENUM ('CREDIT', 'DEBIT');

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL,
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    amount NUMERIC(20,6) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status transaction_status NOT NULL DEFAULT 'PENDING',
    type transaction_type NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT tx_wallet_idem UNIQUE (wallet_id, reference)
);

-- Explicit status transition matrix;
CREATE TABLE IF NOT EXISTS tx_status_transition (
  from_status transaction_status NOT NULL,
  to_status   transaction_status NOT NULL,
  PRIMARY KEY (from_status, to_status),
  CONSTRAINT no_self_transition CHECK (from_status <> to_status)
);

-- Business rules
INSERT INTO tx_status_transition (from_status, to_status) VALUES
  ('PENDING','SUCCESSFUL'),
  ('PENDING','FAILED')  
ON CONFLICT DO NOTHING;

--- Block Deletes from happening. We're building an append-only ledger
CREATE OR REPLACE FUNCTION trg_transactions_block_delete()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'DELETE is forbidden: transactions are append-only.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_no_delete
BEFORE DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION trg_transactions_block_delete();

-- Control Updates: Only status and metadata can be edited/updated
CREATE OR REPLACE FUNCTION trg_transactions_controlled_update()
RETURNS trigger AS $$
DECLARE
  _status_changed boolean := NEW.status IS DISTINCT FROM OLD.status;
  _metadata_changed boolean := NEW.metadata IS DISTINCT FROM OLD.metadata;
  _other_changed boolean := (
        NEW.wallet_id     IS DISTINCT FROM OLD.wallet_id
     OR NEW.amount        IS DISTINCT FROM OLD.amount
     OR NEW.currency      IS DISTINCT FROM OLD.currency
     OR NEW.created_at    IS DISTINCT FROM OLD.created_at
     OR NEW.reference IS DISTINCT FROM OLD.reference
  );
  _ok_transition boolean;
BEGIN
  -- Only status/metadata may change
  IF _other_changed THEN
    RAISE EXCEPTION
      'Only status and metadata may be updated on transactions (attempted change to immutable fields).';
  END IF;

  -- If status changes, it must be whitelisted by the matrix
  IF _status_changed THEN
    SELECT EXISTS (
      SELECT 1
      FROM tx_status_transition
      WHERE from_status = OLD.status
        AND to_status   = NEW.status
    ) INTO _ok_transition;

    IF NOT _ok_transition THEN
      RAISE EXCEPTION 'Illegal status transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;

  -- keep updated_at fresh on any allowed update
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_controlled_update
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION trg_transactions_controlled_update();


-- Wallet Balances Table
CREATE TABLE IF NOT EXISTS wallet_balances (
    wallet_id UUID PRIMARY KEY REFERENCES wallets(id),
    balance NUMERIC(20,6) NOT NULL DEFAULT 0,
    currency VARCHAR(3),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wallet Balances 
CREATE OR REPLACE FUNCTION update_wallet_balance_trigger()
RETURNS TRIGGER AS $$
DECLARE
    updated_rows INT;
BEGIN
    -- Only update balance if transaction is confirmed/successful
    IF NEW.status != 'SUCCESSFUL' THEN
        RETURN NEW;
    END IF;

    -- Lock wallet balance row to prevent race conditions
    PERFORM 1 FROM wallet_balances WHERE wallet_id = NEW.wallet_id FOR UPDATE;

    -- Ensure wallet balance exists
    INSERT INTO wallet_balances(wallet_id, balance, currency)
    VALUES (NEW.wallet_id, 0, NEW.currency)
    ON CONFLICT (wallet_id) DO NOTHING;

    -- CREDIT
    IF NEW.type = 'CREDIT' THEN
      UPDATE wallet_balances
      SET balance = balance + NEW.amount, updated_at = now()
      WHERE wallet_id = NEW.wallet_id
      RETURNING 1 INTO updated_rows;
    
    ELSIF NEW.type = 'DEBIT' THEN
      -- enforce no overdraft
      UPDATE wallet_balances
      SET balance = balance - NEW.amount,
        updated_at = now()
      WHERE wallet_id = NEW.wallet_id
      AND balance - NEW.amount >= 0
      RETURNING 1 INTO updated_rows;
    END IF;

    IF updated_rows IS NULL THEN
        RAISE EXCEPTION 'Insufficient funds for wallet %', NEW.wallet_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wallet_balance_update
AFTER INSERT OR UPDATE OF status ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance_trigger();



