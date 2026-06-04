# 🚗 Online Car Rental System

<div align="center">
  A full-stack web application built with the MERN stack that provides a seamless platform for users to browse, book, and manage car rentals, featuring role-based admin controls and real-time availability tracking.
</div>

---

## 📖 About The Project

The Online Car Rental System is a modern, responsive web application designed to digitize and simplify the car rental experience. Built on a robust MERN stack architecture, it offers a secure and intuitive platform for both customers and administrators. 

Users can easily browse a diverse fleet of vehicles, check real-time availability, and make bookings seamlessly. Administrators are equipped with a powerful dashboard to manage inventory, track reservations, and handle user accounts, ensuring efficient daily operations.

---

## 🏛️ System Architecture

The application follows a standard Client-Server architecture utilizing the MERN stack.

```mermaid
graph TD
    Client[📱 Frontend Client<br/>React + Vite + Tailwind] -->|HTTP REST APIs| Server[⚙️ Backend Server<br/>Node.js + Express]
    Server -->|Mongoose ODM| DB[(🗄️ Database<br/>MongoDB Atlas)]
    
    subgraph Frontend Features
        UI[User Interface]
        State[State Management]
        Auth[JWT Storage]
    end
    Client -.-> Frontend Features
    
    subgraph Backend Services
        API[RESTful Endpoints]
        AuthS[Bcrypt Hash & JWT]
        Business[Booking Logic]
    end
    Server -.-> Backend Services
```

---

## 🔥 Key Features

### For Users
* **Authentication:** Secure login and registration with JSON Web Tokens (JWT).
* **Vehicle Browsing:** Browse a catalog of available cars with detailed specifications.
* **Real-time Booking:** Check car availability and make instant reservations.
* **Responsive UI:** Optimized experience for desktop, tablet, and mobile viewing.

### For Administrators
* **Inventory Management:** Add, edit, delete, and manage car details (price, specs, availability).
* **Booking Oversight:** View, update booking status, or cancel user bookings.
* **User Management:** Oversee registered accounts and their statuses.

---

## 🛠️ Tech Stack

### Frontend
* **React.js** (UI Library)
* **TypeScript** (Static Typing)
* **Vite** (Build Tool)
* **Tailwind CSS** (Styling)

### Backend
* **Node.js** (Runtime)
* **Express.js** (Web Framework)
* **Bcrypt.js & JWT** (Security & Authentication)

### Database
* **MongoDB** (NoSQL Database)
* **Mongoose** (Object Data Modeling)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Sourabh-Dhote/Online-car-rental.git
cd Online-car-rental
```

### 2️⃣ Install dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd ../server
npm install
```

### 3️⃣ Environment Configuration

Create a `.env` file in the `server` folder and configure your MongoDB connection:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
ADMIN_PASSWORD=your_admin_password
```

### 4️⃣ Run the project

**Start backend:**
```bash
cd server
npm run dev
# API runs on http://localhost:5000
```

**Start frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 📁 Project Structure

```text
Online-Car-Rental/
├── frontend/             # React application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Application routes/pages
│   │   ├── services/     # API integration logic
│   │   └── App.tsx       # Main component
│   └── vite.config.ts    # Vite configuration
└── server/               # Node.js + Express backend
    ├── index.js          # Main server & route definitions
    ├── seedCars.js       # Database seeding utility
    └── package.json      # Backend dependencies
```

---

## 🚀 Future Improvements

* 💳 Payment Gateway Integration (Stripe/PayPal)
* 📜 Comprehensive Booking history for users
* 📧 Email notifications for booking confirmations
* 📊 Admin analytics dashboard with charts

---

## 📜 License

This project is licensed under the MIT License.

---

## 🙋‍♂️ Author

**Sourabh Dhote**
