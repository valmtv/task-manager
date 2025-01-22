-- Create the Users table
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('Admin', 'Manager', 'Team Member') NOT NULL,
    password VARCHAR(255) NOT NULL
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
    assigned_to INT,
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    due_date DATE,
    FOREIGN KEY (project_id) REFERENCES Projects(id),
    FOREIGN KEY (assigned_to) REFERENCES Users(id)
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
    type ENUM('Deadline', 'Task Update', 'Overdue') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
