

CREATE TABLE IF NOT EXISTS wallet_topup_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    user_id UUID NOT NULL,
    amount NUMERIC NOT NULL,
    currency CHAR(3) NOT NULL,
    status topup_status NOT NULL DEFAULT 'PENDING',
    paystack_reference VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    webhook_payload JSONB
)