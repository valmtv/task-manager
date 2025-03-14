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

#### 4.1 Create .env file in the backend directory and add the following environment variables

```
MYSQL_HOST='localhost'
MYSQL_USER='username'
MYSQL_PASSWORD='password'
MYSQL_DATABASE='database name(eg. task-manager)'
JWT_KEY='secure key'
EMAIL_USER='email' // for sending emails
EMAIL_PASSWORD='password' // password to that email(App password might be needed)
GOOGLE_CALLBACK_URL='http://localhost:3000/auth/google/callback' // for google login
```
#### 4.2 Those variables has to be set up and taken on https://console.cloud.google.com/ 
##### And they are required for google sign in functionality

```
GOOGLE_CLIENT_ID='google client id' // for google login
GOOGLE_CLIENT_SECRET='google client secret' // for google login
SESSION_SECRET='session secret' // for session management
```

#### 4.3 Create .env file in frontend directory and do the same
```
REACT_APP_GOOGLE_CLIENT_ID='same as GOOGLE_CLIENT_ID in backend directory'
``` 

### 5. Versions Used 

Node.js: v20.9.0
<br>
mysql: Ver 9.0.1 for macos14.7 on x86_64 (Homebrew)
<br>
Rest of the dependencies can be found in the package.json file in the respective directories.

