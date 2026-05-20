-- Reset all user passwords to bcrypt hash of "Admin123!"
-- Using the original hash from data.sql
UPDATE users SET password = '$2a$10$ikjzzODHCj1dfzAbQc6v5.wumFMly5sb/pYGEZbRwG2WkCQQNsnd2', failed_login_attempts = 0, locked_until = NULL;
