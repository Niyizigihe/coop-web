CREATE DATABASE IF NOT EXISTS cooperative_db;
USE cooperative_db;

CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    names VARCHAR(100) NOT NULL,
    national_id VARCHAR(16) UNIQUE NOT NULL,
    phone VARCHAR(20),
    cooperative_name VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
