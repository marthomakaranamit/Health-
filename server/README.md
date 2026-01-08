# Server Setup

## Environment Variables

Create a `.env` file in the `server` folder with the following variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/health_records
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
```

### Example JWT_SECRET:
You can generate a random secret or use a simple one for development:
```
JWT_SECRET=health_records_secret_key_2024
```

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "patient" // optional: admin, doctor, receptionist, patient (default)
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient"
    }
  }
  ```

#### Login User
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient"
    }
  }
  ```

## Using Protected Routes

To access protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The auth middleware will verify the token and attach the user object to `req.user`.

---

### Users (Admin only)

#### Get All Users
- **GET** `/api/users`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Admin only

#### Create User
- **POST** `/api/users`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Admin only
- **Body:**
  ```json
  {
    "name": "Dr. Smith",
    "email": "doctor@hospital.com",
    "password": "password123",
    "role": "doctor"
  }
  ```

#### Update User
- **PUT** `/api/users/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Admin only

#### Delete User
- **DELETE** `/api/users/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Admin only

---

### Patients

#### Register Patient
- **POST** `/api/patients`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Receptionist, Admin
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "age": 30,
    "gender": "Male",
    "bloodGroup": "O+",
    "contactNumber": "1234567890",
    "address": "123 Main St",
    "medicalHistory": [],
    "allergies": []
  }
  ```

#### Get All Patients
- **GET** `/api/patients`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Admin, Doctor, Receptionist

#### Get Patient by ID
- **GET** `/api/patients/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Admin, Doctor, Receptionist, Patient (own record only)

#### Update Patient Details
- **PUT** `/api/patients/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Receptionist, Admin
- **Note:** Only non-medical fields can be updated

---

### Medical Visits

#### Add Medical Visit
- **POST** `/api/visits`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Doctor only
- **Body:**
  ```json
  {
    "patientID": "patient_id_here",
    "diagnosis": "Common cold",
    "prescription": "Rest and fluids",
    "notes": "Patient should rest for 2-3 days",
    "visitDate": "2024-01-15T10:00:00Z"
  }
  ```

#### Get Patient Visit History
- **GET** `/api/visits/:patientId`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Doctor, Admin, Patient (own visits only)

#### Get All Visits
- **GET** `/api/visits`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Doctor (own visits), Admin (all visits)

---

### Appointments

#### Create Appointment
- **POST** `/api/appointments`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Receptionist, Admin, Patient (own appointments)
- **Body:**
  ```json
  {
    "patientID": "patient_id_here",
    "doctorID": "doctor_id_here",
    "appointmentDate": "2024-01-20T14:00:00Z"
  }
  ```

#### Get Appointments
- **GET** `/api/appointments`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** All authenticated users (filtered by role)
  - Patient: Own appointments only
  - Doctor: Own appointments only
  - Admin/Receptionist: All appointments

#### Update Appointment Status
- **PUT** `/api/appointments/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Admin, Receptionist, Doctor (own appointments)
- **Body:**
  ```json
  {
    "status": "Completed" // Scheduled, Completed, Cancelled
  }
  ```

#### Cancel Appointment
- **DELETE** `/api/appointments/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Access:** Admin, Receptionist, Patient (own appointments)
