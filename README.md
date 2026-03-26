# Smart Campus Resource Booking System

## Project Structure

```
smart-campus/
├── .env                        ← Environment variables (edit this)
│
├── backend/                    ← Node.js / Express server
│   ├── app.js                  ← Entry point
│   ├── package.json
│   ├── seed.js                 ← Sample data loader
│   ├── models/
│   │   ├── User.js
│   │   ├── Resource.js
│   │   └── Booking.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── adminController.js
│   │   ├── dashboardController.js
│   │   └── resourceController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── resourceRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── views/                  ← Pug templates
│       ├── layout.pug
│       ├── home.pug
│       ├── dashboard.pug
│       ├── 404.pug
│       ├── error.pug
│       ├── partials/
│       ├── auth/
│       ├── resources/
│       ├── bookings/
│       └── admin/
│
└── frontend/                   ← Static assets served by Express
    ├── css/
    │   ├── main.css
    │   └── components.css
    └── js/
        ├── main.js
        ├── validate-register.js
        ├── validate-login.js
        ├── booking-form.js
        ├── validate-resource.js
        ├── search.js
        └── dashboard.js
```

---

## How the two folders connect

The `backend/` server uses Express to **serve the `frontend/` folder as static files**:

```js
// backend/app.js
app.use(express.static(path.join(__dirname, '..', 'frontend')));
```

So when a browser requests `/css/main.css`, Express serves `frontend/css/main.css`.
When it requests `/js/booking-form.js`, it serves `frontend/js/booking-form.js`.

The Pug templates in `backend/views/` reference these with:
```pug
link(rel="stylesheet", href="/css/main.css")
script(src="/js/booking-form.js")
```

---

## Setup & Installation

### 1. Edit the `.env` file in the project root

```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/smart_campus
SESSION_SECRET=pick_a_long_random_string
NODE_ENV=development
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Seed sample data (first time only)

```bash
node seed.js
```

Credentials created:
- **Admin:**    `admin@campus.ca` / `admin123`
- **Student 1:** `student1@campus.ca` / `student123`
- **Student 2:** `student2@campus.ca` / `student123`

### 4. Start the server

```bash
npm start
```

Visit: **http://localhost:3000**

For auto-restart during development:
```bash
npm run dev
```

---

## Notes

- All `npm install` and `npm start` commands are run from the **`backend/`** folder
- The `frontend/` folder has no build step — pure HTML/CSS/JS, no bundler needed
- The `.env` file lives at the **root** (one level above `backend/`), so both folders can share it if needed in future
