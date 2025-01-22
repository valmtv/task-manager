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

Create a .env file in the backend directory and add the following:

```
MYSQL_HOST='localhost'
MYSQL_USER='username'
MYSQL_PASSWORD='password'
MYSQL_DATABASE='database name(eg. task-manager)'
JWT_KEY='secure key'
```
