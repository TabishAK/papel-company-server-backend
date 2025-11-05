-- Initialize tenant test database
-- This script runs only on first container creation

-- Create user that can connect from any host
CREATE USER IF NOT EXISTS 'gok_admin'@'%' IDENTIFIED BY 'sssSSS@123#';

-- Grant all privileges to gok_admin user
GRANT ALL PRIVILEGES ON gok_database.* TO 'gok_admin'@'%';
FLUSH PRIVILEGES;

-- Create a sample table to verify the database is working
-- You can remove this if you don't need it
CREATE TABLE IF NOT EXISTS test_connection (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message VARCHAR(255) DEFAULT 'Database initialized successfully'
);

INSERT INTO test_connection (message) VALUES ('Tenant database is ready for connections');