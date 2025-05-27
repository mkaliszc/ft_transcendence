CREATE DATABASE IF NOT EXISTS ${MARIADB_DATABASE};
USE ${MARIADB_DATABASE};

-- Table USERS
CREATE TABLE IF NOT EXISTS USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email_adress VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    number_of_matches INT DEFAULT 0,
    number_of_win INT DEFAULT 0,
    number_of_lose INT DEFAULT 0,
    creation_date DATE DEFAULT CURRENT_DATE,
    last_update DATE DEFAULT CURRENT_DATE,
    customization_data JSON,
    avatar MEDIUMTEXT,
    twoFA BOOLEAN DEFAULT FALSE
);

-- Table MATCHES
CREATE TABLE IF NOT EXISTS MATCHES (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    game_duration TIMESTAMP NOT NULL,
    match_date DATE DEFAULT CURRENT_DATE
);

-- Table USER_MATCH (relation entre USERS et MATCHES)
CREATE TABLE IF NOT EXISTS USER_MATCH (
    match_id INT,
    user_id INT,
    winner BOOLEAN DEFAULT FALSE,
    user_score INT NOT NULL CHECK (user_score >= 0),
    PRIMARY KEY (match_id, user_id),
    FOREIGN KEY (match_id) REFERENCES MATCHES(match_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- Table FRIENDSHIP
CREATE TABLE IF NOT EXISTS FRIENDSHIP (
    friendship_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id1 INT,
    user_id2 INT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    creation_date DATE DEFAULT CURRENT_DATE,
    last_update DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (user_id1) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id2) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT unique_friendship UNIQUE (user_id1, user_id2),
    CHECK (user_id1 != user_id2)
);

CREATE INDEX idx_user_match_match_id ON USER_MATCH(match_id);
CREATE INDEX idx_user_match_user_id ON USER_MATCH(user_id);
CREATE INDEX idx_friendship_user_id1 ON FRIENDSHIP(user_id1);
CREATE INDEX idx_friendship_user_id2 ON FRIENDSHIP(user_id2);