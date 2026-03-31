# API Documentation — Smart Campus Resource Booking System

Base URL: `http://localhost:3000`

---

## Authentication

This application uses **session-based authentication** (not token/JWT). After a successful login, a session cookie is set automatically by the browser. All protected endpoints read from this cookie.

| Access Level | Description |
|---|---|
| 🌐 Public | No login required |
| 🔒 Student | Must be logged in |
| 🔑 Admin | Must be logged in with `role: "admin"` |

---

## Table of Contents

- [Pages & Navigation](#pages--navigation)
- [Auth Endpoints](#auth-endpoints)
- [Resource Endpoints](#resource-endpoints)
- [Booking Endpoints](#booking-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [JSON / AJAX Endpoint](#json--ajax-endpoint)

---

## Pages & Navigation

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | 🌐 Public | Landing page with featured resources |
| GET | `/dashboard` | 🔒 Student | Personal dashboard with bookings |

---

## Auth Endpoints

### `GET /auth/register`
> 🌐 Public — Redirects to `/dashboard` if already logged in

Renders the registration form.

**Response:** HTML page

---

### `POST /auth/register`
> 🌐 Public

Creates a new student account and auto-logs in on success.

**Request Body** (form data):

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | String | ✅ | Min 2 characters |
| `email` | String | ✅ | Valid email format, must be unique |
| `password` | String | ✅ | Min 6 characters |
| `confirmPassword` | String | ✅ | Must match `password` |
| `studentId` | String | ❌ | Optional student ID |

**Success:** Redirects to `/dashboard` with flash message `"Welcome, {name}!"`

**Failure:** Re-renders form with error messages (duplicate email, validation errors)

---

### `GET /auth/login`
> 🌐 Public — Redirects to `/dashboard` if already logged in

Renders the login form.

**Response:** HTML page

---

### `POST /auth/login`
> 🌐 Public

Authenticates a user and creates a session.

**Request Body** (form data):

| Field | Type | Required |
|---|---|---|
| `email` | String | ✅ |
| `password` | String | ✅ |

**Success:** Redirects to `/dashboard` with flash message `"Welcome back, {name}!"`

**Failure:** Re-renders form with `"Invalid email or password."` (intentionally vague for security)

---

### `GET /auth/logout`
> 🔒 Student

Destroys the session and clears the session cookie.

**Response:** Redirects to `/auth/login`

---

## Resource Endpoints

### `GET /resources`
> 🌐 Public

Lists all campus resources. Supports search and filtering via query parameters.

**Query Parameters:**

| Param | Type | Description | Example |
|---|---|---|---|
| `search` | String | Search name, description, and location | `?search=mac+lab` |
| `category` | String | Filter by type: `room`, `lab`, `equipment`, `study-space`, `all` | `?category=lab` |
| `available` | String | `"true"` to show only available resources | `?available=true` |

**Example requests:**
```
GET /resources
GET /resources?search=computer
GET /resources?category=lab&available=true
GET /resources?search=building+c&category=room
```

**Response:** HTML page with filtered resource grid

---

### `GET /resources/:id`
> 🌐 Public

Shows the detail page for a single resource.

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId of the resource |

**Example:**
```
GET /resources/64f1a2b3c4d5e6f7a8b9c0d1
```

**Success:** HTML page with resource details and booking button (if logged in)

**Failure:** Redirects to `/resources` with flash error if ID not found

---

## Booking Endpoints

> All booking endpoints require login (`🔒 Student`). Unauthenticated requests are redirected to `/auth/login`.

---

### `GET /bookings/new`
> 🔒 Student

Renders the new booking form. Optionally pre-selects a resource.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `resourceId` | String | Pre-selects a resource in the dropdown |

**Example:**
```
GET /bookings/new
GET /bookings/new?resourceId=64f1a2b3c4d5e6f7a8b9c0d1
```

**Response:** HTML booking form

---

### `POST /bookings`
> 🔒 Student

Creates a new booking. Performs server-side conflict detection before saving.

**Request Body** (form data):

| Field | Type | Required | Rules |
|---|---|---|---|
| `resourceId` | String | ✅ | Valid resource ObjectId |
| `date` | String | ✅ | Format: `YYYY-MM-DD`, cannot be in the past |
| `startTime` | String | ✅ | Format: `HH:MM` (e.g. `09:00`) |
| `endTime` | String | ✅ | Format: `HH:MM`, must be after `startTime` |
| `purpose` | String | ❌ | Optional description |

**Success:** Redirects to `/dashboard` with flash `"Booking confirmed for {resource name}!"`

**Failure — validation error:** Re-renders form with field error messages

**Failure — time conflict:** Re-renders form with `"That time slot is already booked."`

---

### `GET /bookings/:id/edit`
> 🔒 Student (owner only)

Renders the edit form for an existing booking.

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId of the booking |

**Authorization:** Only the booking owner can access this. Returns redirect + flash error if another user tries.

**Response:** HTML edit form pre-filled with existing booking data

---

### `POST /bookings/:id/edit`
> 🔒 Student (owner only)

Updates an existing booking. The resource cannot be changed — only date, time, and purpose.

**Request Body** (form data):

| Field | Type | Required | Rules |
|---|---|---|---|
| `date` | String | ✅ | Format: `YYYY-MM-DD` |
| `startTime` | String | ✅ | Format: `HH:MM` |
| `endTime` | String | ✅ | Format: `HH:MM`, must be after `startTime` |
| `purpose` | String | ❌ | Optional |

**Conflict check:** Excludes the current booking from the conflict query (so it doesn't conflict with itself).

**Success:** Redirects to `/dashboard` with flash `"Booking updated successfully!"`

**Failure:** Re-renders form with errors

---

### `POST /bookings/:id/delete`
> 🔒 Student (owner) or 🔑 Admin

Permanently deletes a booking.

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId of the booking |

**Authorization:** Must be the booking owner OR an admin.

**Success:** Redirects to `/dashboard` with flash `"Booking cancelled successfully."`

---

## JSON / AJAX Endpoint

This is the only endpoint that returns **JSON** instead of HTML. It is called by `booking-form.js` in the browser via `fetch()` to show live booked slots without a page reload.

---

### `GET /bookings/booked-slots`
> 🔒 Student

Returns all confirmed bookings for a specific resource on a specific date.

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `resourceId` | String | ✅ | MongoDB ObjectId of the resource |
| `date` | String | ✅ | Format: `YYYY-MM-DD` |

**Example request:**
```
GET /bookings/booked-slots?resourceId=64f1a2b3c4d5e6f7a8b9c0d1&date=2026-04-15
```

**Success response** `200 OK`:
```json
{
  "slots": [
    { "startTime": "09:00", "endTime": "11:00" },
    { "startTime": "14:00", "endTime": "16:00" }
  ]
}
```

**Empty response** (no bookings that day):
```json
{
  "slots": []
}
```

**Error response** `500`:
```json
{
  "error": "Failed to fetch booked slots."
}
```

**How it's used client-side:**
```js
// booking-form.js
const response = await fetch(`/bookings/booked-slots?resourceId=${id}&date=${date}`);
const data     = await response.json();
// data.slots is used to highlight conflicting time options in the dropdowns
```

---

## Admin Endpoints

> All admin endpoints require login AND `role: "admin"`. Any other user is redirected to `/dashboard`.

---

### `GET /admin`
> 🔑 Admin

Admin overview dashboard showing system stats and recent bookings.

**Response:** HTML page with total users, resources, bookings count, and a recent bookings table

---

### `GET /admin/resources`
> 🔑 Admin

Lists all resources (including unavailable ones) in a management table.

**Response:** HTML page

---

### `GET /admin/resources/new`
> 🔑 Admin

Renders the create resource form.

**Response:** HTML form

---

### `POST /admin/resources`
> 🔑 Admin

Creates a new campus resource.

**Request Body** (form data):

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | String | ✅ | Min 2 chars, must be unique |
| `category` | String | ✅ | One of: `room`, `lab`, `equipment`, `study-space` |
| `capacity` | Number | ✅ | Min 1, max 500 |
| `location` | String | ❌ | Defaults to `"Main Campus"` |
| `description` | String | ❌ | Free text |
| `features` | String | ❌ | One feature per line (textarea) |

**Success:** Redirects to `/admin/resources` with flash confirmation

**Failure — duplicate name:** Re-renders form with `"A resource with that name already exists."`

---

### `GET /admin/resources/:id/edit`
> 🔑 Admin

Renders the edit form pre-filled with existing resource data.

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId of the resource |

---

### `POST /admin/resources/:id/edit`
> 🔑 Admin

Updates an existing resource. All fields including availability can be changed.

**Request Body** (form data):

| Field | Type | Required |
|---|---|---|
| `name` | String | ✅ |
| `category` | String | ✅ |
| `capacity` | Number | ✅ |
| `location` | String | ❌ |
| `description` | String | ❌ |
| `features` | String | ❌ |
| `isAvailable` | String | ❌ | `"true"` or `"false"` |

**Success:** Redirects to `/admin/resources` with flash confirmation

---

### `POST /admin/resources/:id/delete`
> 🔑 Admin

Deletes a resource AND all of its associated bookings (cascade delete).

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId of the resource |

**Success:** Redirects to `/admin/resources` with flash confirmation

---

### `GET /admin/bookings`
> 🔑 Admin

Lists every booking in the system across all users, with user and resource details populated.

**Response:** HTML table sorted by date descending

---

### `GET /admin/users`
> 🔑 Admin

Lists all registered users (passwords excluded).

**Response:** HTML table sorted by registration date descending

---

### `POST /admin/users/:id/delete`
> 🔑 Admin

Deletes a user account AND all of their bookings (cascade delete).

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId of the user |

**Guard:** Admin cannot delete their own account — returns flash error if attempted.

**Success:** Redirects to `/admin/users` with flash confirmation

---

## Data Models Reference

### User
```json
{
  "_id": "ObjectId",
  "name": "Jane Smith",
  "email": "student1@campus.ca",
  "password": "<bcrypt hash — never returned>",
  "role": "student | admin",
  "studentId": "041234567",
  "createdAt": "2026-01-15T10:30:00.000Z",
  "updatedAt": "2026-01-15T10:30:00.000Z"
}
```

### Resource
```json
{
  "_id": "ObjectId",
  "name": "Computer Lab B",
  "category": "lab",
  "description": "Windows workstations with Adobe Suite.",
  "capacity": 24,
  "location": "Technology Building, Room 102",
  "isAvailable": true,
  "features": ["Windows PCs", "Adobe Suite", "Microsoft Office"],
  "createdBy": "ObjectId (ref: User)",
  "createdAt": "2026-01-10T09:00:00.000Z",
  "updatedAt": "2026-01-10T09:00:00.000Z"
}
```

### Booking
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User)",
  "resource": "ObjectId (ref: Resource)",
  "date": "2026-04-15T00:00:00.000Z",
  "startTime": "10:00",
  "endTime": "12:00",
  "purpose": "Group project meeting",
  "status": "confirmed | pending | cancelled",
  "createdAt": "2026-03-26T08:00:00.000Z",
  "updatedAt": "2026-03-26T08:00:00.000Z"
}
```

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Route not found | Renders `404.pug` with status 404 |
| Server error | Renders `error.pug` with status 500 (shows message in dev mode) |
| Unauthenticated access to protected route | Redirects to `/auth/login` with flash error |
| Non-admin access to admin route | Redirects to `/dashboard` with flash error |
| Invalid MongoDB ObjectId | Caught by try/catch, redirects with flash error |
