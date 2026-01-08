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
