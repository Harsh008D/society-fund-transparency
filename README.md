
# Society Fund Transparency Dashboard

A MERN stack web application designed to help housing societies manage and track their funds and expenses transparently.

## Features

- User authentication with role-based access for admins and residents
- Society registration and resident invitation system
- Fund and expense management
- Dashboard with fund, expense, and balance summaries
- Financial reports with date filters
- Edit and delete funds and expenses
- CSV export for financial records

## Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT

## Project Structure

```text
society-fund-transparency/
├── client/   # React frontend
└── server/   # Express backend
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Harsh008D/society-fund-transparency.git
cd society-fund-transparency
```

### 2. Install dependencies

```bash
cd server
npm install
```

```bash
cd ../client
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `server` folder and add your own values:

```env
PORT=5050
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Do not upload your actual `.env` file or secrets to GitHub.

### 4. Run the application

Start the backend in one terminal:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Open the local URL shown by Vite in your browser.

## Author

Harsh Dholakiya