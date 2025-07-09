# Doctor Appointment System Backend

A comprehensive Node.js backend API for managing doctor appointments with MongoDB.

## Features

### Backend - https://doctor-appointment-s3yb.onrender.com/api
### Frontend - https://get-doctor-appointment.netlify.app/


## For frontend code, visit the master branch.



### Authentication & Authorization
- User registration and login (JWT-based)
- Role-based access control (Patient, Doctor, Admin)
- Secure password hashing with bcryptjs

### User Management
- Patient profiles
- Doctor profiles with specializations
- Admin controls

### Appointment System
- Book appointments with doctors
- View available time slots
- Appointment status management
- Cancel appointments
- Complete appointments with notes/prescriptions

### Doctor Features
- Create and manage doctor profiles
- Set availability schedules
- View and manage appointments
- Add prescriptions and notes

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Installation

1. **Clone and setup**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/doctor_appointment
   JWT_SECRET=your_very_strong_secret_key_here
   JWT_EXPIRE=7d
   ```

3. **Start MongoDB**
   - Local: Make sure MongoDB is running
   - Or use MongoDB Atlas connection string

4. **Run the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile

### Doctors (`/api/doctors`)
- `GET /` - Get all doctors (with filters)
- `GET /:id` - Get doctor by ID
- `POST /profile` - Create doctor profile (Doctor only)
- `PUT /profile` - Update doctor profile (Doctor only)
- `PUT /availability` - Update availability (Doctor only)
- `GET /meta/specializations` - Get all specializations

### Patients (`/api/patients`)
- `GET /` - Get all patients (Admin/Doctor only)
- `GET /:id` - Get patient by ID (Admin/Doctor only)
- `GET /:id/appointments` - Get patient appointments
- `PUT /:id/status` - Activate/Deactivate patient (Admin only)

### Appointments (`/api/appointments`)
- `POST /` - Book appointment (Patient only)
- `GET /` - Get appointments (filtered by role)
- `GET /:id` - Get appointment by ID
- `PUT /:id/status` - Update appointment status (Doctor/Admin)
- `PUT /:id/cancel` - Cancel appointment
- `PUT /:id/complete` - Complete appointment (Doctor only)
- `GET /doctor/:doctorId/availability` - Get available slots

## Data Models

### User
- Basic info (name, email, phone, etc.)
- Role (patient/doctor/admin)
- Address information

### Doctor
- Links to User model
- Specialization and qualifications
- Experience and license number
- Consultation fees
- Availability schedule
- Hospital information

### Appointment
- Patient and Doctor references
- Date and time
- Status tracking
- Notes and prescriptions
- Payment information

## Sample API Usage

### 1. Register a Patient
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient",
  "phone": "+1234567890"
}
```

### 2. Register a Doctor
```bash
POST /api/auth/register
{
  "name": "Dr. Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "doctor",
  "phone": "+1234567890"
}
```

### 3. Create Doctor Profile
```bash
POST /api/doctors/profile
Authorization: Bearer <token>
{
  "specialization": "Cardiology",
  "qualification": "MD, MBBS",
  "experience": 10,
  "licenseNumber": "DOC123456",
  "consultationFee": 150,
  "availability": [
    {
      "day": "monday",
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true
    }
  ]
}
```

### 4. Book Appointment
```bash
POST /api/appointments
Authorization: Bearer <patient_token>
{
  "doctor": "doctor_id_here",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "10:00",
  "reason": "Regular checkup"
}
```

### 5. Get Available Slots
```bash
GET /api/appointments/doctor/doctor_id_here/availability?date=2024-01-15
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Role-based authorization
- Input validation
- MongoDB injection protection

## Development

### Database Schema
The system automatically creates collections and indexes when you start adding data.

### Adding New Features
1. Create model in `/models`
2. Create routes in `/routes`
3. Add middleware if needed
4. Update this README

## Production Deployment

1. Set production environment variables
2. Use MongoDB Atlas for database
3. Deploy to platforms like Heroku, AWS, or DigitalOcean
4. Set up proper logging and monitoring

## License

MIT License
