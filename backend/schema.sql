-- Database: e_order
CREATE DATABASE IF NOT EXISTS e_order CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE e_order;

CREATE TABLE IF NOT EXISTS commands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  command_number VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  date_received DATE NOT NULL,
  `type` ENUM('TOR','Evaluation','Inspection') NOT NULL,
  agency VARCHAR(255) DEFAULT NULL,
  details TEXT,
  `status` ENUM('In Progress','Completed') DEFAULT 'In Progress',
  fiscal_year VARCHAR(10) NOT NULL,
  fiscal_half ENUM('first_half','second_half') NOT NULL,
  file_path VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_type ON commands(`type`);
CREATE INDEX idx_status ON commands(`status`);
CREATE INDEX idx_fiscal_year ON commands(fiscal_year);
