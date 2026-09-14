# 🌱 AgroBridge — AI-Powered Agricultural Marketplace & Smart Logistics Platform

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

AgroBridge is a modern, full-stack agricultural disintermediation and quick-commerce ecosystem that connects farmers directly with consumers and commercial bulk buyers. The platform integrates **Smart Logistics**, **AI Fair Price Discovery**, **AI Demand Forecasting**, **Multi-Stop Route Optimization (TSP)**, **AgroBridge Assured Quality Verification**, **Progressive Dispute Mediation**, and an **AI-Assisted Farmer Risk Indicator Engine**.

---

## 👥 The 5 User Roles & Unified Dashboards

| Role | Role Card | Portal Login | Features & Capabilities |
| :--- | :--- | :--- | :--- |
| **👨‍🌾 Farmer** | "Continue as Farmer" | `/farmer/login` | List harvests, multi-image upload, live inventory, incoming commercial RFQ orders, price advisory, quality verification badge, feedback & reputation scorecard. |
| **🛒 Consumer** | "Continue as Consumer" | `/consumer/login` | Hyperlocal fresh produce marketplace, category search, smart price comparison (88% direct-to-farmer value), demo escrow checkout, 3-point live GPS delivery tracking. |
| **🏢 Bulk Buyer** | "Continue as Bulk Buyer" | `/bulk-buyer/login` | Wholesale B2B marketplace, 6 dynamic fast-filters (`Assured`, `Near Me`, `Best Deals`), 4-tier volume pricing calculator, RFQs, 9-factor AI Best Deal matching, wholesale feedback. |
| **🚚 Driver** | "Continue as Driver" | `/driver/login` | Dedicated fleet logistics console, automatic smart driver assignment, farm-gate OTP pickup, consumer delivery OTP, route telemetry status. |
| **👨‍💼 Admin** | "Continue as Admin" | `/admin/login` | Operations oversight, 5-role directory, product quality audits, dispute mediation, `/admin/farmers` compliance directory, progressive action engine, AI-Assisted Risk Engine. |

---

## 🔑 Demo Login Credentials

All demo accounts come pre-configured and seed automatically:

| Role | Email Identifier | Password |
| :--- | :--- | :--- |
| **Farmer** | `farmer@agrobridge.demo` | `Demo@123` |
| **Consumer** | `consumer@agrobridge.demo` | `Demo@123` |
| **Bulk Buyer** | `bulkbuyer@agrobridge.demo` | `Demo@123` |
| **Driver** | `driver@agrobridge.demo` | `Demo@123` |
| **Admin** | `admin@agrobridge.demo` | `Demo@123` |

> 🛡️ **Strict Cross-Role Rejection**: Attempting to log into the wrong portal (e.g. Farmer credentials on Consumer Portal) is automatically rejected with **HTTP 403** and a 1-click redirect button.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/agrobridge.git
cd agrobridge
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Build & Run
You can launch both frontend and backend concurrently or run the backend:

**Option A — 1-Click Launch (Windows)**:
Double-click `start_agrobridge.bat`

**Option B — Terminal**:
```bash
# In /server:
node server.js
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

---

## 🧠 Key Innovations & Architecture

### 1. AI-Assisted Farmer Risk Indicator Engine (`/admin/farmers`)
- Multi-factor risk calculation analyzing verified complaints, complaint frequency, dispute severity, average buyer ratings, and order history.
- Categorizes producers into `LOW RISK`, `MEDIUM RISK`, or `HIGH RISK` with an advisory compliance score (`0–100`).
- Strict Human-in-the-Loop policy: zero automated punishments; administrative warnings, temporary unlisting, and suspensions require human administrator authorization.

### 2. Marketplace Isolation & Protection Framework
- When an administrative unlisting or suspension occurs, the backend immediately hides the farmer's produce from both consumer and bulk buyer marketplaces (`/api/products` and `/api/bulk/products`).
- New crop listing creation is blocked with **HTTP 403 Forbidden**.
- Active deliveries and in-transit orders continue uninterrupted to protect buyer supply and driver payouts.

### 3. 9-Factor AI Best Deal Match Engine
- Commercial wholesale buyer recommendations calculating distance, volume discount tiers, historical reliability, quality certification score, APMC Mandi savings, and fulfillment speed.

### 4. Smart Multi-Stop Route Optimization (TSP)
- Nearest-neighbor and Traveling Salesperson Problem algorithms optimizing rural farm collection routes and reducing logistics transit time.

---

## 🧪 Automated Testing

AgroBridge includes comprehensive automated test suites covering all workflows and role security:

```bash
cd server

# Run Admin Farmer Management & Compliance Test Suite (40 tests)
node test_admin_farmer_system.js

# Run Full Platform End-to-End Regression Suite (66 tests)
node test_end_to_end.js
```

**Test Status**: `106 / 106 Tests Passing (100%)`.

---

## 📂 Project Structure

```
agrobridge/
├── client/                     # Frontend Application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # AgroProductImage, Modals, Navbar, etc.
│   │   ├── pages/              # FarmerDashboard, ConsumerDashboard, BulkBuyerDashboard, AdminDashboard, DriverDashboard
│   │   └── services/           # api.js client API abstraction
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend API Server (Node.js + Express)
│   ├── config/                 # In-Memory & Database drivers
│   ├── controllers/            # authController, etc.
│   ├── middleware/             # authMiddleware (JWT, role verification)
│   ├── models/                 # User.js, etc.
│   ├── routes/                 # adminRoutes, marketplaceRoutes, farmerRoutes, consumerRoutes, etc.
│   ├── services/               # dataService.js, userService.js
│   ├── uploads/                # Local produce image assets
│   ├── test_admin_farmer_system.js
│   ├── test_end_to_end.js
│   └── server.js
├── .gitignore                  # Production Git ignore rules
├── README.md                   # Platform documentation
└── start_agrobridge.bat        # Windows 1-Click launcher
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
