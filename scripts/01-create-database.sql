CREATE DATABASE IF NOT EXISTS aiims_jammu;

USE aiims_jammu;


CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time VARCHAR(20),
    message TEXT,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    head_doctor VARCHAR(100),
    available_days VARCHAR(50) DEFAULT 'Monday-Saturday',
    available_hours VARCHAR(50) DEFAULT '8:00 AM - 2:00 PM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO departments (name, description, head_doctor, available_days, available_hours) VALUES
('Cardiology', 'Heart and cardiovascular diseases treatment', 'Dr. Rajesh Kumar', 'Monday-Saturday', '8:00 AM - 2:00 PM'),
('Neurology', 'Brain and nervous system disorders', 'Dr. Priya Sharma', 'Monday-Saturday', '9:00 AM - 1:00 PM'),
('Orthopedics', 'Bone, joint, and muscle treatments', 'Dr. Amit Singh', 'Monday-Friday', '8:00 AM - 2:00 PM'),
('Pediatrics', 'Child healthcare and treatment', 'Dr. Sunita Devi', 'Monday-Saturday', '8:00 AM - 12:00 PM'),
('General Medicine', 'General health checkups and treatment', 'Dr. Vikram Gupta', 'Monday-Saturday', '8:00 AM - 2:00 PM'),
('Emergency', '24/7 Emergency medical services', 'Dr. Emergency Team', 'All Days', '24/7');


CREATE INDEX idx_appointments_email ON appointments(email);
CREATE INDEX idx_appointments_date ON appointments(preferred_date);
CREATE INDEX idx_appointments_status ON appointments(status);
