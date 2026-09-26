-- 2) Auth log table (მხოლოდ ავტორიზაცია/აუთენთიკაცია)
CREATE TABLE IF NOT EXISTS auth_log (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),                      -- როცა user ვერ მოიძებნა, მაინც ინახავ მცდელობას
    event_type VARCHAR(32) NOT NULL,         -- login_success | login_failed | logout | register
    reason VARCHAR(128),                     -- მაგალითად: invalid_password, user_not_found, rate_limited
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_log_user_id ON auth_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_log_email ON auth_log(email);
CREATE INDEX IF NOT EXISTS idx_auth_log_event_type ON auth_log(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_log_created_at ON auth_log(created_at);

-- 1) Security events table (ზოგადი უსაფრთხოების ინციდენტები)
CREATE TABLE IF NOT EXISTS security_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,         -- მაგალითად: rate_limited, token_invalid, permission_denied
    severity VARCHAR(16) NOT NULL DEFAULT 'low', -- low | medium | high
    actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip_masked VARCHAR(64),                   -- მაგალითად: 192.168.1.0/24
    user_agent TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_actor_user_id ON security_events(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_metadata_gin ON security_events USING GIN (metadata);



-- user_agent არის HTTP request-ის სათაური, რომელიც ამბობს კლიენტი რა აპლიკაციიდან მოდის.

-- მაგალითად შეიცავს ასეთ ინფორმაციას:

-- ბრაუზერი: Chrome, Safari, Firefox
-- ოპერაციული სისტემა: macOS, Windows, Android, iOS
-- ზოგჯერ მოწყობილობის ტიპიც: Mobile/Desktop
-- ტიპური მაგალითი:
-- Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36

