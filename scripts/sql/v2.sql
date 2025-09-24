
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username character varying(30),
    email VARCHAR(255) UNIQUE NOT NULL,
    date_of_birth DATE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE, 
    auth_provider JSONB,
    wallets JSONB,
    firebase_uid VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

