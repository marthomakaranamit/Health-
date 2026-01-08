# Health Record Management System

---

## 1. PROJECT OVERVIEW
**Project Title:** Health Record Management System  
**Tech Stack:** MERN Stack (MongoDB, Express, React, Node.js)

---

## 2. PROBLEM STATEMENT
Many hospitals and clinics still rely on paper-based or poorly organized digital systems for managing patient health records.  
This causes several challenges such as:

- Difficulty in quickly accessing patient medical history.
- Risk of data loss, duplication, or physical damage to records.
- Poor data security and lack of proper access control.
- Long waiting times for patients during registration and consultations.
- Inefficient coordination between doctors, receptionists, and administrators.

These issues reduce efficiency and negatively impact the quality of healthcare delivery.

---

## 3. PROPOSED SOLUTION
The proposed system is a **web-based Health Record Management System** that securely stores and manages patient health records in a centralized database.

The system enables:
- Secure storage of patient medical data.
- Role-based access for Admin, Doctor, Receptionist, and Patient.
- Faster patient registration and record retrieval.
- Improved coordination between hospital staff.
- Enhanced data security and integrity.

---

## 4. USER ROLES & PERMISSIONS

### A. Admin (Hospital Administrator)
- Can login to the Admin Dashboard.
- Can add, edit, or remove users (Doctors, Receptionists, Patients).
- Can assign roles and permissions.
- Can view all patient records.
- Can monitor system activities.

---

### B. Doctor
- Can login securely.
- Can view assigned patient records.
- Can add diagnoses, prescriptions, and treatment notes.
- Can update medical history after consultations.
- Can view previous medical visit records.

---

### C. Receptionist
- Can login securely.
- Can register new patients.
- Can update patient personal details (non-medical).
- Can schedule patient appointments.
- Can search and retrieve patient records for administrative purposes.
- Cannot view or edit medical diagnosis or prescriptions.

---

### D. Patient
- Can register and login.
- Can view personal profile information.
- Can view medical history, prescriptions, and visit records.
- Cannot modify any medical records.

---

## 5. DATABASE STRUCTURE (Schemas)

### A. User Schema
- Name (String)
- Email (String, Unique)
- Password (Hashed)
- Role (String: `admin`, `doctor`, `receptionist`, `patient`)
- CreatedAt (Timestamp)

---

### B. Patient Record Schema
- PatientID (Reference to User)
- Age (Number)
- Gender (String)
- BloodGroup (String)
- ContactNumber (String)
- Address (String)
- MedicalHistory (Array of Strings)
- Allergies (Array of Strings)
- CreatedAt (Timestamp)

---

### C. Medical Visit Schema
- PatientID (Reference to User)
- DoctorID (Reference to User)
- Diagnosis (String)
- Prescription (String)
- Notes (String)
- VisitDate (Timestamp)

---

### D. Appointment Schema
- PatientID (Reference to User)
- DoctorID (Reference to User)
- AppointmentDate (Timestamp)
- Status (String: `Scheduled`, `Completed`, `Cancelled`)
- CreatedAt (Timestamp)

---

## 6. FEATURE WORKFLOW (User Journey)

1. Receptionist logs in and registers a new patient.
2. Patient details are saved in the database.
3. Receptionist schedules an appointment with a doctor.
4. Doctor logs in and views the appointment list.
5. Doctor accesses the patient’s medical record during consultation.
6. Doctor adds diagnosis and prescription.
7. Patient logs in later to view updated medical history.
8. Admin oversees system usage and manages users.

---

## 7. API ENDPOINTS

### Authentication
- **POST** `/api/auth/register` → Register new user  
- **POST** `/api/auth/login` → Login user  

---

### Users & Patients
- **GET** `/api/users` → Get all users (Admin only)
- **POST** `/api/patients` → Register new patient (Receptionist/Admin)
- **GET** `/api/patients/:id` → View patient record
- **PUT** `/api/patients/:id` → Update patient personal details

---

### Medical Visits
- **POST** `/api/visits` → Add medical visit (Doctor only)
- **GET** `/api/visits/:patientId` → Get patient visit history

---

### Appointments
- **POST** `/api/appointments` → Create appointment
- **PUT** `/api/appointments/:id` → Update appointment status
- **GET** `/api/appointments` → View appointments

---

## 8. CONCLUSION
The Health Record Management System provides a secure, efficient, and user-friendly solution for managing patient data in healthcare facilities.  
By introducing role-based access for Admins, Doctors, Receptionists, and Patients, the system ensures data privacy, improves workflow efficiency, and enhances healthcare service delivery.

---
