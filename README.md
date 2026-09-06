# 🛒 Online Store — Full Stack E-Commerce System

A complete, production-ready full-stack e-commerce web application built from scratch with Node.js, Express, MySQL, and Vanilla JavaScript. Includes a customer storefront, shopping cart, order management, and a powerful admin dashboard.

![Dark Theme](https://img.shields.io/badge/Theme-Dark-black?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![MySQL](https://img.shields.io/badge/Database-MySQL-blue?style=flat-square&logo=mysql)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=flat-square)
![Google OAuth](https://img.shields.io/badge/OAuth-Google-red?style=flat-square&logo=google)
![Cloudinary](https://img.shields.io/badge/Images-Cloudinary-blue?style=flat-square)
![Deployed](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| Frontend | [online-store-snowy-alpha.vercel.app](https://online-store-snowy-alpha.vercel.app) |
| Backend API | [online-store-rq6j.onrender.com](https://online-store-rq6j.onrender.com) |

---

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Font Awesome icons
- Google Fonts (Bebas Neue, DM Sans, DM Mono)
- Fully responsive — mobile, tablet, desktop

### Backend
- Node.js + Express.js
- REST API architecture
- JWT authentication
- bcrypt password hashing
- Passport.js + Google OAuth 2.0
- Multer + Cloudinary (image uploads)
- express-session
- CORS

### Database
- MySQL hosted on Clever Cloud
- 10 tables with relationships and foreign keys

### Deployment
- Frontend → Vercel
- Backend → Render
- Database → Clever Cloud
- Images → Cloudinary
- Uptime → UptimeRobot

---

## ✨ Features

### 👤 Customer
- Browse products with search, category filter, and sorting
- Product details page with multi-image gallery and zoom
- Live side panel cart with quantity controls
- Place and track orders
- Star rating + written product reviews
- Register with email or Google OAuth
- Show/hide password + real password strength indicator
- Profile page (avatar, info, addresses, orders, password)
- Profile picture upload
- Address management (add, delete, set default)
- Navbar avatar dropdown
- Fully responsive + hamburger menu on mobile

### ⚙️ Admin
- Dashboard with live stats (revenue, orders, customers, products)
- Add / Edit / Delete products via modal
- Upload multiple product images via Cloudinary
- Category management (add, delete)
- View and update all orders
- Stock auto-restored when order cancelled
- Protected with admin role middleware

### 🔒 Security
- bcrypt password hashing
- JWT tokens with 7 day expiry
- Google OAuth 2.0
- Admin role middleware
- Environment variables for all secrets
- CORS enabled

---

## 🗄️ Database Schema

```
users            → id, name, email, password, phone, profile_picture, role, created_at
categories       → id, name
products         → id, category_id, name, description, price, stock, image_url, created_at
product_images   → id, product_id, image_url, is_primary
product_reviews  → id, product_id, user_id, rating, comment, created_at
cart             → id, user_id, created_at
cart_items       → id, cart_id, product_id, quantity
orders           → id, user_id, status, total, created_at
order_items      → id, order_id, product_id, quantity, price
addresses        → id, user_id, full_name, phone, street, city, country, is_default
payments         → id, order_id, method, status, amount, paid_at
```

---

## 🌐 API Endpoints

### Auth
```
POST   /auth/register
POST   /auth/login
GET    /auth/google
GET    /auth/google/callback
```

### Products
```
GET    /products
GET    /products/:id
GET    /products/:id/reviews
POST   /products/:id/reviews       (protected)
DELETE /products/:id/reviews/:id   (protected)
```

### Cart (protected)
```
GET    /cart
POST   /cart
PUT    /cart/:id
DELETE /cart/:id
```

### Orders (protected)
```
GET    /orders
GET    /orders/:id
POST   /orders
```

### Profile (protected)
```
GET    /profile
PUT    /profile
POST   /profile/picture
PUT    /profile/password
GET    /profile/addresses
POST   /profile/addresses
DELETE /profile/addresses/:id
PUT    /profile/addresses/:id/default
```

### Admin (protected + admin role)
```
GET    /admin/stats
GET    /admin/orders
GET    /admin/orders/:id
PUT    /admin/orders/:id
GET    /admin/products
POST   /admin/products
PUT    /admin/products/:id
DELETE /admin/products/:id
POST   /admin/products/:id/images
DELETE /admin/images/:id
GET    /admin/categories
POST   /admin/categories
DELETE /admin/categories/:id
```

---

## 📁 Project Structure

```
online-store/
├── Front-end/
│    ├── admin/
│    │    ├── index.html
│    │    ├── products.html
│    │    └── orders.html
│    ├── css/
│    │    ├── style.css
│    │    └── admin.css
│    ├── js/
│    │    ├── api.js
│    │    ├── auth.js
│    │    ├── navbar.js
│    │    ├── products.js
│    │    ├── product.js
│    │    ├── cart.js
│    │    ├── orders.js
│    │    ├── profile.js
│    │    └── admin/
│    │         ├── dashboard.js
│    │         ├── products.js
│    │         └── orders.js
│    ├── index.html
│    ├── product.html
│    ├── login.html
│    ├── register.html
│    ├── cart.html
│    ├── orders.html
│    ├── profile.html
│    └── auth-success.html
├── config/
│    ├── db.js
│    ├── cloudinary.js
│    └── passport.js
├── controllers/
│    ├── auth.js
│    ├── products.js
│    ├── cart.js
│    ├── orders.js
│    ├── reviews.js
│    ├── profile.js
│    └── admin.js
├── middleware/
│    ├── auth.js
│    └── admin.js
├── routes/
│    ├── auth.js
│    ├── products.js
│    ├── cart.js
│    ├── orders.js
│    ├── reviews.js
│    ├── profile.js
│    └── admin.js
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MySQL database
- Cloudinary account
- Google OAuth credentials

### 1. Clone the repository
```bash
git clone https://github.com/taha20353/online-store.git
cd online-store
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
```env
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=3306
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:5500
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=3000
```

### 4. Set up the database
Run the SQL schema in your MySQL database to create all tables.

### 5. Run the server
```bash
# Development
npm run dev

# Production
npm start
```

### 6. Open the frontend
Open `Front-end/index.html` with Live Server or deploy to Vercel.

---

## 👑 Create Admin User

After registering, run this in your MySQL database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Then logout and login again to get a new token with admin role.

---

## 📦 npm Packages

```json
{
  "express": "^4.x",
  "mysql2": "^3.x",
  "dotenv": "^16.x",
  "bcryptjs": "^2.x",
  "jsonwebtoken": "^9.x",
  "cors": "^2.x",
  "passport": "^0.x",
  "passport-google-oauth20": "^2.x",
  "express-session": "^1.x",
  "cloudinary": "^1.x",
  "multer": "^1.x",
  "multer-storage-cloudinary": "^4.x"
}
```

---

## 🚀 Deployment

### Backend (Render)
1. Connect your GitHub repo to Render
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add all environment variables

### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set root directory to `Front-end`
3. Deploy

### Database (Clever Cloud)
1. Create a MySQL addon
2. Run your SQL schema
3. Copy credentials to Render environment variables

---

## 📸 Screenshots

> Homepage, Product Page, Admin Dashboard, Profile Page

---

## 🧑‍💻 Author

**Mostafa Sultan**
- GitHub: [@taha20353](https://github.com/taha20353)
- LinkedIn: [Mostafa Sultan](https://linkedin.com/in/mostafa-sultan-60a147262/)

---

## 📄 License

This project is for portfolio and educational purposes.

---

> Built with ❤️ from Egypt 🇪🇬
