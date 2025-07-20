# Doctor Appointment System Frontend

A responsive and interactive frontend application built with React for managing doctor appointments.

## Live Demo

- Frontend: [https://get-doctor-appointment.netlify.app](https://get-doctor-appointment.netlify.app)
- Backend API: [https://doctor-appointment-s3yb.onrender.com/api](https://doctor-appointment-s3yb.onrender.com/api)

## Features

### User Access
- Patient, Doctor, and Admin dashboards
- Role-based UI rendering
- Responsive navigation based on user role
a
### Authentication
- User registration and login
- JWT token stored securely in local storage
- Protected routes

### Doctor Dashboard
- Create and manage profile
- Update availability schedule
- View and manage appointments
- Add prescription/notes for completed appointments

### Patient Dashboard
- Search for doctors by specialization
- Book appointments with available slots
- View, cancel, or reschedule appointments

### Admin Dashboard
- View all doctors and patients
- Activate or deactivate users
- Monitor all appointments

## Technologies Used

- React
- React Router
- Axios
-  Tailwind CSS
- Context API (for global state management)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <your-frontend-repo-url>
cd frontend
npm install
```

2. Set up environment variables

Create a `.env` file in the root of the frontend folder and add:

```
API_BASE_URL=https://doctor-appointment-s3yb.onrender.com/api
```

3. Run the frontend

```bash
npm start
```

The app will run at `http://localhost:5173`

