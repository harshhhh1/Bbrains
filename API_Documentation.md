# API Documentation

Welcome to the comprehensive Bbrains API Documentation. This guide covers the essential endpoints, authentication methods, standard response formats, and error codes used across the system.

## 📑 Table of Contents

- [Base URL & Authentication](#base-url--authentication)
- [Standardized Responses](#standardized-responses)
- [Authentication Endpoints](#authentication-endpoints)
- [User Profile Endpoints](#user-profile-endpoints)
- [Academic Endpoints](#academic-endpoints)
- [Marketplace & Wallet Endpoints](#marketplace--wallet-endpoints)
- [Standard Error Codes](#standard-error-codes)

---

## 🔒 Base URL & Authentication

**Base URL**: `http://localhost:3000` *(or your production domain)*

**Dual Authentication Strategy**:
Bbrains uses a combination of custom JWT tokens and Supabase Auth.
- Web clients receive an **HTTP-only cookie** containing the JWT upon successful login.
- Third-party consumers or mobile clients can pass the token in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```
*Note: Ensure the backend's strict CORS policy allows your origin if you are calling from a browser.*

---

## 📦 Standardized Responses

All API responses follow a predictable JSON format defined in `server/src/utils/response.js`:

**Success Response (200/201)**:
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... } // or array
}
```

**Paginated Success Response (200)**:
```json
{
  "success": true,
  "message": "Data retrieved.",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "totalPages": 3
  }
}
```

**Error Response (4xx/5xx)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

## 🛡️ Authentication Endpoints

### 1. `POST /register`
Registers a new user in the system. Triggers an audit log entry.

- **Request Body**:
  ```json
  {
    "username": "johndoe_12",
    "email": "johndoe@example.com",
    "password": "securePassword123",
    "collegeId": 45
  }
  ```
- **Response (201 Created)**: Returns the generated user ID and username.

### 2. `POST /login`
Authenticates a user, verifies the bcrypt password hash, and issues a JWT HTTP-only cookie.

- **Request Body**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "securePassword123"
  }
  ```
- **Response (200 OK)**: Returns the user's populated profile and token.

### 3. `POST /logout`
Clears the JWT HTTP-only cookie.

- **Response (200 OK)**: A simple success message.

---

## 👤 User Profile Endpoints

### 1. `GET /user/me`
Fetches the currently authenticated user's profile, including their XP, level, and role details.

- **Headers**: Requires valid JWT token.
- **Response (200 OK)**: Returns the nested user object from Prisma.

### 2. `POST /user/claim-daily`
Claims the daily streak reward for the user. Optimized to prevent N+1 query issues.

- **Headers**: Requires valid JWT token.
- **Response (200 OK)**: Returns the updated streak count and XP rewarded.

---

## 📚 Academic Endpoints

### 1. `GET /academic/assignments`
Retrieves a list of assignments based on the user's role (Student vs. Teacher) and enrolled courses.

- **Query Parameters**:
  - `courseId` (optional): Filter assignments by course ID.
- **Response (200 OK)**: Returns an array of assignments, including due dates and reward points.

### 2. `POST /academic/submissions`
Submits an assignment (Students only).

- **Request Body**:
  ```json
  {
    "assignmentId": 123,
    "filePath": "https://cloudinary.com/url/to/file.pdf",
    "content": "Optional text submission"
  }
  ```
- **Response (201 Created)**: Returns the submission record and triggers a notification to the teacher.

### 3. `PATCH /academic/submissions/:submissionId/review`
Reviews and grades a submission (Teachers only). Automatically awards XP and triggers a push notification to the student upon "completed" status.

- **Request Body**:
  ```json
  {
    "reviewStatus": "completed",
    "reviewRemark": "Excellent work!"
  }
  ```

---

## 🛒 Marketplace & Wallet Endpoints

### 1. `GET /market/products`
Browses the digital library catalog.

- **Response (200 OK)**: Returns an array of digital or physical products with pricing.

### 2. `POST /market/checkout`
Processes a shopping cart checkout within a secure Prisma Transaction. Validates wallet balance or Razorpay intent before finalizing the order.

- **Request Body**:
  ```json
  {
    "paymentMethod": "wallet",
    "pin": "1234"
  }
  ```
- **Response (200 OK)**: Returns the generated Order ID and transaction receipt.

---

## 🚨 Standard Error Codes

| Code | Type | Meaning | Action Needed |
| :--- | :--- | :--- | :--- |
| **400** | **Bad Request** | Invalid input parameters, or Zod validation failed. | Check the `errors` array in the response for field-specific details. |
| **401** | **Unauthorized** | Missing, expired, or invalid JWT token. | Client must re-authenticate (login). |
| **403** | **Forbidden** | User authenticated, but lacks the necessary RBAC role (e.g., student trying to access teacher routes). | Ensure correct user permissions. |
| **404** | **Not Found** | The requested resource (e.g., an assignment ID) does not exist in the DB. | Verify the ID or URL path. |
| **409** | **Conflict** | The request conflicts with current state (e.g., registering an email that already exists). | Change the unique identifier. |
| **500** | **Internal Error** | Server crashed or failed to process the logic. | Check server logs. Do not expose `req.body` or stack traces to the client. |
| **503** | **Service Down** | Prisma cannot connect to the PostgreSQL database. | Verify `DATABASE_URL` and database health. |
