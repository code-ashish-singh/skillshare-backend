# SkillShare Backend API

SkillShare platform ka **production-ready REST API** — Node.js, Express aur MongoDB se bana hua. Skill Seekers, Skill Providers aur Superadmin ke liye complete backend logic yahan hai.

---

## Features

- JWT authentication — HttpOnly cookies
- Role-based access control — `skillSeeker`, `skillProvider`, `superAdmin`
- Skill aur Plan management
- Booking lifecycle — Pending → Accepted → Completed / Cancelled
- Review system with automatic provider rating recalculation
- Blog management with auto slug generation
- Report / complaint system
- File uploads via Cloudinary (avatar, portfolio, blog cover)
- Rate limiting, Helmet security headers, MongoDB sanitization
- Database seeder with Indian demo data

---

## Tech Stack

| Technology | Use |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Bcrypt | Password hashing |
| Multer + Cloudinary | File uploads |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| express-mongo-sanitize | NoSQL injection protection |
| express-validator | Input validation |
| Morgan | HTTP request logging |

---

## Project Structure

```
src/
├── config/
│   ├── db.js           # MongoDB connection
│   └── cloudinary.js   # Cloudinary + Multer setup
├── controllers/        # Business logic
│   ├── authController.js
│   ├── userController.js
│   ├── providerController.js
│   ├── bookingController.js
│   ├── reviewController.js
│   ├── blogController.js
│   ├── reportController.js
│   └── adminController.js
├── middleware/
│   ├── authMiddleware.js     # JWT protect
│   ├── roleMiddleware.js     # restrictTo roles
│   ├── errorMiddleware.js    # Global error handler
│   ├── uploadMiddleware.js   # Multer wrappers
│   └── validateMiddleware.js # express-validator
├── models/
│   ├── User.js       # Seeker + Provider (unified)
│   ├── Skill.js
│   ├── Plan.js
│   ├── Booking.js
│   ├── Review.js
│   ├── Blog.js
│   └── Report.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── providerRoutes.js
│   ├── bookingRoutes.js
│   ├── reviewRoutes.js
│   ├── blogRoutes.js
│   ├── reportRoutes.js
│   └── adminRoutes.js
├── utils/
│   ├── ApiResponse.js    # Standardized responses
│   ├── asyncHandler.js   # Async error wrapper
│   ├── generateToken.js  # JWT generate + cookie
│   └── seed.js           # Database seeder
├── app.js
└── server.js
```

---

## Setup & Run

**1. Dependencies install karo**
```bash
cd skillshare-backend
npm install
```

**2. Environment configure karo**
```bash
cp .env.example .env
```

`.env` mein apni values daalo:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/skillshare
JWT_SECRET=apna_strong_secret_key_yahan_likho
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

**3. Database seed karo (demo data)**
```bash
npm run seed
```

**4. Server start karo**
```bash
npm run dev
```

Server: `http://localhost:5000`
Health check: `http://localhost:5000/health`

---

## Demo Credentials (after seed)

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@skillshare.com | admin123 |
| Skill Seeker | seeker@demo.com | demo123 |
| Skill Provider | provider@demo.com | demo123 |
| Provider | ananya@demo.com | demo123 |
| Provider | rahul@demo.com | demo123 |
| Provider | meera@demo.com | demo123 |
| Provider | karthik@demo.com | demo123 |
| Provider | divya@demo.com | demo123 |

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Access |
|---|---|---|
| POST | `/register` | Public |
| POST | `/login` | Public |
| POST | `/logout` | Private |
| GET | `/me` | Private |
| PUT | `/change-password` | Private |
| PUT | `/update-profile` | Private |

### Users & Providers — `/api/users`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/providers` | Public |
| GET | `/providers/:id` | Public |
| PUT | `/provider-profile` | Provider |
| POST | `/portfolio` | Provider |
| DELETE | `/portfolio/:publicId` | Provider |

### Skills & Plans — `/api/providers`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/skills` | Public |
| GET | `/skills/:id` | Public |
| GET | `/my-skills` | Provider |
| POST | `/skills` | Provider |
| PUT | `/skills/:id` | Provider |
| DELETE | `/skills/:id` | Provider |
| POST | `/skills/:skillId/plans` | Provider |
| PUT | `/plans/:id` | Provider |
| DELETE | `/plans/:id` | Provider |

### Bookings — `/api/bookings`
| Method | Endpoint | Access |
|---|---|---|
| POST | `/` | Seeker |
| GET | `/my` | Seeker |
| GET | `/provider` | Provider |
| GET | `/:id` | Private |
| PUT | `/:id/status` | Private |
| DELETE | `/:id` | Seeker |

### Reviews — `/api/reviews`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/provider/:providerId` | Public |
| POST | `/` | Seeker |
| PUT | `/:id` | Seeker |
| DELETE | `/:id` | Seeker |

### Blogs — `/api/blogs`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/` | Public |
| GET | `/:id` | Public |
| POST | `/` | Admin |
| PUT | `/:id` | Admin |
| DELETE | `/:id` | Admin |

### Reports — `/api/reports`
| Method | Endpoint | Access |
|---|---|---|
| POST | `/` | Seeker |
| GET | `/my` | Seeker |
| GET | `/` | Admin |
| PUT | `/:id` | Admin |
| DELETE | `/:id` | Admin |

### Admin — `/api/admin`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/dashboard` | Admin |
| GET | `/analytics` | Admin |
| GET | `/users` | Admin |
| PUT | `/users/:id/block` | Admin |
| DELETE | `/users/:id` | Admin |
| GET | `/providers` | Admin |
| PUT | `/providers/:id/approve` | Admin |
| PUT | `/providers/:id/reject` | Admin |
| PUT | `/providers/:id/block` | Admin |
| DELETE | `/providers/:id` | Admin |
| GET | `/bookings` | Admin |
| GET | `/reviews` | Admin |
| PUT | `/reviews/:id/toggle` | Admin |
| DELETE | `/reviews/:id` | Admin |
| GET | `/blogs` | Admin |
| POST | `/blogs` | Admin |
| PUT | `/blogs/:id` | Admin |
| DELETE | `/blogs/:id` | Admin |
| GET | `/reports` | Admin |
| PUT | `/reports/:id` | Admin |
| DELETE | `/reports/:id` | Admin |

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` ya `production` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Strong random secret key |
| `JWT_EXPIRE` | Token expiry (e.g. `7d`) |
| `JWT_COOKIE_EXPIRE` | Cookie expiry in days |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL (CORS) |
| `ADMIN_URL` | Admin panel URL (CORS) |

---

## NPM Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | nodemon src/server.js | Development server |
| `npm start` | node src/server.js | Production server |
| `npm run seed` | node src/utils/seed.js | Database seeder |

---

## Related Projects

- [skillshare](../skillshare) — Main user-facing frontend
- [skillshare-admin](../skillshare-admin) — Admin dashboard panel
