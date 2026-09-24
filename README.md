# Bus Pass Management System

A modern full-stack web application designed for college transit systems. Built for Diploma Computer Engineering internships, college project demonstrations, technical viva exams, and seminar presentations.

---

## 1. Project Overview

The **Bus Pass Management System** simplifies and digitizes the process of issuing college student bus passes. It eliminates paperwork, long counter queues, and manual verification errors by offering an end-to-end digital lifecycle:
- Students can register, log in, apply for a bus pass, select routes and validity periods, make simulated demo payments, download/print receipts, and monitor their application status in real-time.
- Administrators can log in through a dedicated management portal, view live metrics, inspect student applications, and approve or reject passes with a single click.

---

## 2. Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3, Font Awesome 6.5, Google Fonts (Poppins)
- **Backend**: Python 3.10+, FastAPI, Uvicorn (ASGI server)
- **Database**: PostgreSQL / Supabase
- **ORM**: SQLAlchemy 2.0+
- **Configuration**: python-dotenv, Pydantic v2
- **Architecture**: RESTful API with decoupled Client-Server architecture and CORS support

---

## 3. Project Structure

```
BusPassManagement/
│
├── app/
│   │
│   ├── __init__.py            # Python package initialization
│   ├── main.py                # FastAPI entry point, CORS, routers & static files
│   ├── database.py            # SQLAlchemy database engine and session dependency
│   ├── models.py              # Database tables (Student, BusPass, Payment)
│   ├── schemas.py             # Pydantic schemas for request/response validation
│   ├── crud.py                # Database queries and statistics operations
│   ├── config.py              # Environment variable loader
│   │
│   ├── .env                   # Configuration file (DATABASE_URL, Admin credentials)
│   │
│   ├── routers/
│   │   ├── __init__.py        # Routers package initialization
│   │   ├── student.py         # Student registration, login, profile endpoints
│   │   ├── buspass.py         # Pass application, history, and details endpoints
│   │   ├── admins.py          # Admin authentication, approvals, and statistics
│   │   └── payment.py         # Demo payment gateway simulation & receipts
│   │
│   └── frontend/
│       ├── index.html         # Landing page with hero, features, about & stats
│       ├── register.html      # Student registration page
│       ├── login.html         # Student login page
│       ├── apply.html         # Bus pass application form
│       ├── payment.html       # Demo fee payment gateway (₹300)
│       ├── receipt.html       # Printable bus pass fee invoice/receipt
│       ├── status.html        # Live application tracking table
│       ├── admin.html         # Administrator login page
│       ├── admin_dashboard.html # Admin control console with approvals
│       │
│       ├── style.css          # Global stylesheet (Poppins, colors, badges, print)
│       ├── home.css           # Landing page hero and cards styling
│       ├── script.js          # Unified API client and DOM event handling
│       │
│       └── images/
│           └── bus.png        # Stylized transit bus illustration
│
├── requirements.txt           # Python dependencies
└── README.md                  # Comprehensive project documentation
```

---

## 4. Installation & Setup

### Prerequisites
- Python 3.10 or higher installed. Check with:
  ```bash
  python --version
  ```

### Step 1: Navigate to the Project Directory
```bash
cd BusPassManagement
```

### Step 2: Create and Activate a Python Virtual Environment
**On Windows (PowerShell / Command Prompt):**
```bash
python -m venv venv
.\venv\Scripts\activate
```
*(On macOS/Linux: `source venv/bin/activate`)*

### Step 3: Install Required Dependencies
```bash
pip install -r requirements.txt
```

---

## 5. Database Configuration (PostgreSQL / Supabase)

The database connection is managed via `app/.env`.

### Connecting to Supabase:
1. Create a free project on [Supabase](https://supabase.com).
2. Go to **Project Settings** &rarr; **Database** &rarr; **Connection String** &rarr; **URI**.
3. Open `app/.env` and paste your Supabase connection string:
   ```env
   DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```
4. Tables (`students`, `bus_passes`, `payments`) are **automatically created** on the first launch! No manual SQL scripts required.

> **Offline/Local Viva Note**: If no remote PostgreSQL database is reachable or credentials are not yet configured, the system automatically initializes a local SQLite database (`buspass.db`) as a fail-safe fallback so the presentation never crashes!

---

## 6. Running the Application

From inside the `BusPassManagement` directory, run:

```bash
uvicorn app.main:app --reload
```

The terminal will display:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

### Accessing the Web Application:
- **Home Page**: [http://127.0.0.1:8000/frontend/index.html](http://127.0.0.1:8000/frontend/index.html) or [http://127.0.0.1:8000/portal](http://127.0.0.1:8000/portal)
- **Interactive Swagger API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **API Root Check**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

## 7. Default Credentials & Roles

| Role | Portal URL | Username / Email | Password |
|---|---|---|---|
| **Administrator** | `/frontend/admin.html` | `admin` | `admin123` |
| **Student** | `/frontend/login.html` | Registered Email (e.g. `rahul@gmail.com`) | Registered Password |

---

## 8. Complete Project Demonstration Workflow

```
[ HOME ] (index.html)
   │
   ├─► [ REGISTER ] (register.html) ──► Fills Name, Email, Mobile, College, Password
   │                                           │ (Submits & validates duplicate email)
   ├─► [ LOGIN ] (login.html) ◄────────────────┘
   │      │ (Authenticates & stores session)
   │      ▼
   ├─► [ APPLY BUS PASS ] (apply.html) ──► Selects Source, Destination, Dates, Type
   │                                              │ (Submits with 'Pending' status)
   │                                              ▼
   ├─► [ PAYMENT GATEWAY ] (payment.html) ──► Enters demo card details for ₹300
   │                                              │ (Records transaction)
   │                                              ▼
   ├─► [ PAYMENT RECEIPT ] (receipt.html) ◄───────┘
   │      │ (Prints invoice / Back to status)
   │      ▼
   ├─► [ STUDENT STATUS ] (status.html) ──► Displays Pending / Approved / Rejected badge
   │
   │   --- ADMIN SIDE ---
   │
   ├─► [ ADMIN LOGIN ] (admin.html) ──► Username: admin | Password: admin123
   │      │
   │      ▼
   └─► [ ADMIN DASHBOARD ] (admin_dashboard.html)
          ├─► Live Counter Cards (Total, Pending, Approved, Rejected)
          ├─► Real-time application table
          └─► Click [Approve] or [Reject] ──► Status updates instantly in database!
```

---

## 9. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Root verification endpoint (`"Bus Pass API Running"`) |
| `POST` | `/student/register` | Register student with duplicate email validation |
| `POST` | `/student/login` | Authenticate student and obtain session credentials |
| `GET` | `/student/{id}` | Retrieve profile details of a student |
| `POST` | `/buspass/apply` | Submit new bus pass application |
| `GET` | `/buspass/student/{student_id}` | Fetch all pass applications for a student |
| `GET` | `/buspass/{pass_id}` | Retrieve full pass and payment receipt details |
| `POST` | `/payment/process` | Record demo payment transaction (₹300) |
| `GET` | `/payment/pass/{pass_id}` | Get payment receipt information |
| `POST` | `/admin/login` | Authenticate transit administrator |
| `GET` | `/admin/buspasses` | Retrieve all applications with student details |
| `PUT` | `/admin/buspass/{id}` | Update application status (`Approved` / `Rejected`) |
| `GET` | `/admin/stats` | Live counters for dashboard & landing page |

---

## 10. Sample Viva & Project Defense Questions

1. **Why FastAPI over Flask or Django?**
   - FastAPI offers high asynchronous performance, automatic Pydantic data validation, built-in OpenAPI/Swagger interactive documentation (`/docs`), and cleaner type hints.
2. **How is data persistence handled?**
   - Using SQLAlchemy ORM connected to PostgreSQL / Supabase, utilizing relational models with foreign keys linking Students, Bus Passes, and Payments.
3. **How does the frontend communicate with the backend?**
   - Through standard asynchronous JavaScript `fetch()` API calls with JSON payloads, protected against Cross-Origin issues via FastAPI CORS Middleware.
