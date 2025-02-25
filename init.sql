-- Create the Roles table
CREATE TABLE Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Insert initial roles
INSERT INTO Roles (name) VALUES ('Admin'), ('Manager'), ('Team Member');

-- Create the Users table
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) DEFAULT NULL UNIQUE,
    role_id INT NOT NULL,
    profile_picture_id INT DEFAULT NULL,
    FOREIGN KEY (role_id) REFERENCES Roles(id) ON DELETE CASCADE
);

-- Create the ProfilePictures table
CREATE TABLE ProfilePictures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL, -- NULL for default avatars
    name VARCHAR(255) NOT NULL,
    image_data LONGBLOB NOT NULL, -- Binary image data
    is_default BOOLEAN DEFAULT FALSE, -- TRUE for default avatars, FALSE for user-uploaded images
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Add foreign key to Users table for profile_picture_id
ALTER TABLE Users
ADD FOREIGN KEY (profile_picture_id) REFERENCES ProfilePictures(id) ON DELETE SET NULL;

-- Create the Confirmations table with a status column
CREATE TABLE Confirmations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('phone', 'email') NOT NULL,
    confirmed_at DATETIME DEFAULT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create the Projects table
CREATE TABLE Projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started'
);

-- Create the Tasks table
CREATE TABLE Tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    due_date DATE,
    FOREIGN KEY (project_id) REFERENCES Projects(id)
);

-- Create the TaskAssignments table
CREATE TABLE TaskAssignments (
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (task_id, user_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create the TimeLogs table
CREATE TABLE TimeLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    duration INT, -- in minutes
    FOREIGN KEY (task_id) REFERENCES Tasks(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Create the Resources table
CREATE TABLE Resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255),
    quantity INT,
    cost DECIMAL(10, 2)
);

-- Create the ProjectResources table
CREATE TABLE ProjectResources (
    project_id INT NOT NULL,
    resource_id INT NOT NULL,
    PRIMARY KEY (project_id, resource_id),
    CONSTRAINT fk_project_resources_project FOREIGN KEY (project_id) REFERENCES Projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_resources_resource FOREIGN KEY (resource_id) REFERENCES Resources(id) ON DELETE CASCADE
);

-- Create the TaskDependencies table
CREATE TABLE TaskDependencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    dependent_task_id INT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES Tasks(id),
    FOREIGN KEY (dependent_task_id) REFERENCES Tasks(id)
);

-- Create the Notifications table
CREATE TABLE Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Create the PasswordResets table
CREATE TABLE PasswordResets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create the Tags, TaskTags, and ProjectTags tables
CREATE TABLE Tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE TaskTags (
    task_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
);

CREATE TABLE ProjectTags (
    project_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (project_id, tag_id),
    FOREIGN KEY (project_id) REFERENCES Projects(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
);

-- Create the VerificationCodes table
CREATE TABLE VerificationCodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    type ENUM('email_verification', 'password_reset') NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);