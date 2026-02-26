CREATE TABLE votes (
    id              BIGSERIAL PRIMARY KEY,
    user_id         TEXT NOT NULL,
    city_raw        TEXT NOT NULL,
    city_normalized TEXT NOT NULL,
    vote            BOOLEAN NOT NULL,
    vote_date       DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_city_day UNIQUE (user_id, city_normalized, vote_date)
);

CREATE INDEX idx_votes_city_date ON votes (city_normalized, vote_date);
CREATE INDEX idx_votes_user_city_date ON votes (user_id, city_normalized, vote_date);
