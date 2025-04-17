# Fees Dashboard Application

A React-based student fees management dashboard with Material UI and Firebase integration.

## Features

- Admin login with authentication
- Student fees tracking table
- Overdue fees highlighting
- Popup reminders for unpaid fees
- Firebase Firestore integration

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a new Firebase project
   - Enable Firestore
   - Replace the Firebase configuration in `src/firebase.js` with your project's configuration

4. Start the development server:
```bash
npm start
```

## Usage

1. Login with the following credentials:
   - Username: admin
   - Password: password

2. View the dashboard to see student fees information
3. Overdue fees will be highlighted in red
4. Popup reminders will appear for overdue fees

## Firebase Data Structure

The application expects a Firestore collection named `students` with documents containing the following fields:
- name (string)
- batch (string)
- feesMonth (string - ISO date format)
- amount (number)
- status (string - "Paid" or "Unpaid") 