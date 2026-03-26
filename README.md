# Smart Campus Resource Booking System
### Algonquin College — Full-Stack Web Development Project

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Runtime     | Node.js                             |
| Framework   | Express.js                          |
| Database    | MongoDB + Mongoose ODM              |
| Views       | Pug templating engine               |
| Auth        | express-session + bcryptjs          |
| Frontend    | Semantic HTML5 + CSS (no frameworks)|
| Client JS   | Vanilla JavaScript (multi-file)     |

---

## Project Structure

```
smart-campus/
├── app.js                      ← Express entry point
├── seed.js                     ← Database seeder
├── .env                        ← Environment variables
├── package.json
│
├── models/
│   ├── User.js                 ← User schema (student/admin)
│   ├── Resource.js             ← Resource schema
│   └── Booking.js              ← Booking schema
│
├── controllers/
│   ├── authController.js       ← Register / Login / Logout
│   ├── dashboardController.js  ← Home + Dashboard
│   ├── resourceController.js   ← Browse + Search resources
│   ├── bookingController.js    ← Full CRUD for bookings
│   └── adminController.js      ← Admin management
│
├── routes/
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   ├── resourceRoutes.js
│   ├── bookingRoutes.js
│   └── adminRoutes.js
│
├── middleware/
│   └── authMiddleware.js       ← requireLogin / requireAdmin / requireGuest
│
├── views/                      ← Pug templates
│   ├── layout.pug              ← Base layout
│   ├── home.pug
│   ├── dashboard.pug
│   ├── 404.pug
│   ├── error.pug
│   ├── partials/
│   │   ├── navbar.pug
│   │   ├── flash.pug
│   │   └── footer.pug
│   ├── auth/
│   │   ├── register.pug
│   │   └── login.pug
│   ├── resources/
│   │   ├── index.pug
│   │   └── show.pug
│   ├── bookings/
│   │   ├── new.pug
│   │   └── edit.pug
│   └── admin/
│       ├── index.pug
│       ├── resources.pug
│       ├── resource-form.pug
│       ├── bookings.pug
│       └── users.pug
│
└── public/
    ├── css/
    │   ├── main.css            ← Layout, typography, responsive
    │   └── components.css      ← Buttons, forms, badges, flash
    └── js/
        ├── main.js             ← Global: navbar toggle, delete confirm
        ├── validate-register.js← Registration form validation
        ├── validate-login.js   ← Login form validation
        ├── booking-form.js     ← Booking validation + live slots fetch
        ├── validate-resource.js← Admin resource form validation
        ├── search.js           ← Search auto-submit + highlight
        └── dashboard.js        ← Stats animation + today highlight
```

---

## Installation & Setup

### Prerequisites
- Node.js v18 or newer
- MongoDB (local install **or** MongoDB Atlas free cluster)

---

### Step 1 — Clone / Download the project

```bash
cd smart-campus
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Configure environment variables

Edit the `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/smart_campus
SESSION_SECRET=change_this_to_a_long_random_string
NODE_ENV=development
```

> **MongoDB Atlas:** Replace `MONGODB_URI` with your Atlas connection string, e.g.:
> `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smart_campus`

### Step 4 — Seed the database (recommended for testing)

```bash
node seed.js
```

This creates:
- **Admin account:**   `admin@campus.ca` / `admin123`
- **Student account:** `student1@campus.ca` / `student123`
- **Student account:** `student2@campus.ca` / `student123`
- 6 campus resources
- 3 sample bookings

### Step 5 — Start the server

```bash
npm start
```

Open your browser at: **http://localhost:3000**

For development with auto-restart on file changes:

```bash
npm run dev
```

---

## Feature Walkthrough

### Public Access (no login required)
- Browse campus resources at `/resources`
- Search by name/location, filter by category and availability
- View resource detail pages

### Student Access (requires login)
- Personal dashboard with upcoming + past bookings
- Create new bookings with live conflict detection
- Edit or cancel existing bookings
- Time slots already booked are visually flagged in the booking form

### Admin Access (admin role required)
- Admin panel at `/admin`
- Add, edit, delete campus resources
- View all bookings across all users
- Manage user accounts

---

## API Endpoints

| Method | Route                             | Description                    |
|--------|-----------------------------------|--------------------------------|
| GET    | /                                 | Home / landing page            |
| GET    | /dashboard                        | User dashboard (auth required) |
| GET    | /auth/register                    | Registration form              |
| POST   | /auth/register                    | Create account                 |
| GET    | /auth/login                       | Login form                     |
| POST   | /auth/login                       | Authenticate user              |
| GET    | /auth/logout                      | Destroy session                |
| GET    | /resources                        | Browse resources (with search) |
| GET    | /resources/:id                    | Resource detail                |
| GET    | /bookings/new                     | New booking form               |
| POST   | /bookings                         | Create booking                 |
| GET    | /bookings/:id/edit                | Edit booking form              |
| POST   | /bookings/:id/edit                | Update booking                 |
| POST   | /bookings/:id/delete              | Delete booking                 |
| GET    | /bookings/booked-slots            | JSON: taken slots (AJAX)       |
| GET    | /admin                            | Admin dashboard                |
| GET    | /admin/resources                  | Manage resources               |
| POST   | /admin/resources                  | Create resource                |
| GET    | /admin/resources/:id/edit         | Edit resource form             |
| POST   | /admin/resources/:id/edit         | Update resource                |
| POST   | /admin/resources/:id/delete       | Delete resource                |
| GET    | /admin/bookings                   | All bookings view              |
| GET    | /admin/users                      | Manage users                   |
| POST   | /admin/users/:id/delete           | Delete user                    |

---

## Testing Scenarios

### Scenario 1: Full Student Flow
1. Go to `/auth/register` → create a student account
2. Redirected to `/dashboard` → see empty bookings
3. Click **Browse Resources** → search "lab", filter Available Only
4. Click **Book Now** on a resource
5. Select a date, start time (09:00), end time (11:00), add a purpose
6. Click **Confirm Booking** → redirected to dashboard with confirmation
7. Click **Edit** on the booking → change the time
8. Click **Cancel** on the booking → confirm deletion

### Scenario 2: Conflict Detection
1. Log in as `student1@campus.ca`
2. Note the existing booking for Boardroom A tomorrow at 10:00–12:00
3. Log in as `student2@campus.ca` in a different browser/incognito
4. Try to book Boardroom A on the same date, 11:00–13:00
5. The booking form will show ⚠ on conflicting time options
6. The server will reject the overlapping booking with an error message

### Scenario 3: Admin Management
1. Log in as `admin@campus.ca`
2. Go to `/admin` → view stats and recent bookings
3. Go to `/admin/resources` → click **Edit** on a resource
4. Change availability to "Unavailable" → save
5. Verify the resource shows "Unavailable" badge on `/resources`
6. Go to `/admin/resources/new` → fill in the form and submit
7. Go to `/admin/users` → view all registered users

### Scenario 4: Form Validation (Client-Side)
1. Go to `/auth/register`
2. Click **Create Account** without filling anything → see all errors appear
3. Type a 2-char password → see "too short" message
4. Enter mismatched passwords → see "do not match" error
5. Fill everything correctly → all fields show green borders, form submits
