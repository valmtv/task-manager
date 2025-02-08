# Task Manager Application

This is a full-stack task manager application built with React (frontend), Node.js (backend), and MySQL (database).


## Setup

### 1. Clone the Repository

```
git clone git@github.com:valmtv/task-manager.git 

```

### 2. Initialize the Database

```
mysql -u root -p
CREATE DATABASE task-manager
exit
mysql -u root -p task-manager < init.sql;
```
init.sql can be deleted after the database is created.

### 3. Install Dependencies

```frontend
cd frontend
npm install
npm start
```

```backend
cd backend
npm install
npm run dev
```

### 4. Set up .env file

Create a .env file in the backend directory and add the following environment variables

```
MYSQL_HOST='localhost'
MYSQL_USER='username'
MYSQL_PASSWORD='password'
MYSQL_DATABASE='database name(eg. task-manager)'
JWT_KEY='secure key'
EMAIL_USER='email' // for sending emails
EMAIL_PASSWORD='password' // password to that email(App password might be needed)
```

### 5. Versions Used 

Node.js: v20.9.0
<br>
mysql: Ver 9.0.1 for macos14.7 on x86_64 (Homebrew)
<br>
Rest of the dependencies can be found in the package.json file in the respective directories.

