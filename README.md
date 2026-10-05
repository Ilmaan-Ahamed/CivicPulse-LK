# CivicPulse LK 

**Community-Verified Public Infrastructure Reporting Platform**

**Live Link:** https://civic-pulse-lk.vercel.app/
---

## Project Title

**CivicPulse LK** — a full-stack civic technology platform designed for Sri Lanka to improve how public infrastructure issues are **reported, verified, coordinated, and resolved**.

> **Report. Verify. Coordinate. Resolve.**

The platform connects **citizens, community verifiers, Divisional Secretariat (DS) Offices, government agencies, NGOs, and community partners** through a transparent workflow.

---

## 🚀 Project Overview

Public infrastructure problems such as damaged roads, blocked drainage, broken streetlights, waste-related issues, and damaged public facilities are often reported through fragmented channels such as social media, phone calls, and messaging platforms.

CivicPulse LK provides a centralized platform where infrastructure issues can be:

* Reported by citizens
* Verified by the community
* Coordinated through the DS Office
* Assigned to relevant government agencies or NGOs
* Field-verified with supporting evidence
* Tracked until resolution
* Presented through a public transparency dashboard

---

## 🎯 Problem Statement

Infrastructure issues in local communities can be difficult to report, verify, track, and resolve because information is often distributed across different communication channels.

CivicPulse LK addresses this problem by creating a structured workflow:

```text
Citizen Report
      ↓
Community Verification
      ↓
DS Office Coordination
      ↓
Government / NGO Assignment
      ↓
Field Verification
      ↓
Resolution
      ↓
Public Transparency
```

The system aims to reduce **unreliable reports, duplicate complaints, poor coordination, and lack of transparency**.

---

## ✨ Key Features

### 👤 Citizen Reporting

Citizens can submit infrastructure issues with:

* Issue category
* Description
* Photograph
* GPS location
* Location information
* Sinhala / Tamil / English support

---

### 🤝 Community Verification

Nearby citizens can help verify reported infrastructure issues.

* View nearby reports
* Confirm genuine issues
* Dispute suspicious reports
* Community confirmation count
* Trust-based verification
* Duplicate report awareness

Community verification helps identify unreliable and duplicate complaints before the official coordination stage.

---

### 🏢 DS Office Coordination

The **Divisional Secretariat (DS) Office** acts as the institutional coordination point.

DS Officers can:

* View verified reports
* Review AI suggestions
* Confirm or edit issue categories
* Review priority recommendations
* Assign cases
* Coordinate with government agencies
* Coordinate with NGOs / volunteer teams
* Track case progress
* Review field verification evidence

---

### 📍 Field Verification & Evidence

Field officers can attach evidence to cases, including:

* Inspection photographs
* GPS information
* Inspection notes
* Verification details

This creates an auditable record from the original report through to resolution.

---

### 📊 Public Transparency Dashboard

Citizens and stakeholders can track public cases through a transparent dashboard.

#### Case Status

```text
Submitted
    ↓
Verified
    ↓
Assigned
    ↓
In Progress
    ↓
Resolved
```

The dashboard can provide:

* Interactive issue map
* Category filters
* Area filters
* Status filters
* Resolution statistics
* Case progress
* Public feedback

---

## 👥 User Roles

| Role           | Responsibilities                              |
| -------------- | --------------------------------------------- |
| **Citizen**    | Submit and track infrastructure reports       |
| **Verifier**   | Verify or dispute nearby reports              |
| **DS Officer** | Verify, coordinate, assign, and monitor cases |
| **Agency**     | Manage assigned government projects           |
| **NGO**        | Support verified community issues             |
| **Admin**      | Manage and monitor the platform               |

---

## 🏗️ System Workflow

```text
                     ┌──────────────────┐
                     │     Citizen      │
                     │  Submit Report   │
                     └────────┬─────────┘
                              ↓
                     ┌──────────────────┐
                     │    Community     │
                     │    Verification  │
                     └────────┬─────────┘
                              ↓
                     ┌──────────────────┐
                     │     DS Office    │
                     │   Verification   │
                     │   & Coordination │
                     └────────┬─────────┘
                              ↓
               ┌──────────────┴──────────────┐
               ↓                             ↓
       ┌───────────────┐             ┌───────────────┐
       │   Government  │             │    NGO /       │
       │    Agency     │             │    Volunteer   │
       └───────┬───────┘             └───────┬───────┘
               └──────────────┬──────────────┘
                              ↓
                     ┌──────────────────┐
                     │ Field Verification│
                     │    & Evidence    │
                     └────────┬─────────┘
                              ↓
                     ┌──────────────────┐
                     │     Resolution   │
                     └────────┬─────────┘
                              ↓
                     ┌──────────────────┐
                     │    Public        │
                     │  Transparency    │
                     └──────────────────┘
```

---

## 🧰 Technology Stack

### Frontend

* **Next.js**
* **React**
* **Tailwind CSS**
* **shadcn/ui**
* **Recharts**
* **Mapbox / react-map-gl**
* **next-themes**

### Backend

* **Node.js**
* **Next.js API Routes**
* **REST API architecture**

### Database

* **PostgreSQL**
* **Neon Database**
* **PostGIS**
* **Prisma ORM**

### Authentication & Security

* **Clerk**
* Role-Based Access Control (**RBAC**)
* Middleware route protection
* **Zod** validation
* **React Hook Form**

### Storage & Background Processing

* **MinIO** — object storage for images and evidence
* **Inngest** — background jobs and scheduled analytics

### Deployment

* **Vercel**
* **GitHub**
* **CI/CD**

---

## 🗄️ Core Data Models

The system is designed around core entities such as:

```text
User
Report
Verification
Case
Assignment
Agency
NGO
```

The database uses **PostgreSQL with PostGIS** to support location-based queries and nearby report verification.

---

## 🔐 Security

CivicPulse LK includes:

* Secure authentication through Clerk
* Role-based authorization
* Protected application routes
* Server-side validation
* Zod schema validation
* Audit logging
* Secure environment variables
* Protected case and user data

AI-generated recommendations are treated as suggestions and remain editable by authorized officers.

---

## 🌍 Multilingual Support

The citizen-facing system is designed to support:

* Sinhala
* Tamil
* English

This improves accessibility for Sri Lankan communities with different language preferences.

---

## ⚙️ Setup Instructions

### Prerequisites

Make sure you have:

* **Node.js**
* **npm / pnpm / yarn**
* **Git**
* **Clerk account**
* **PostgreSQL / Neon database**
* Required API credentials

---

### 1. Clone the Repository

```bash
git clone https://github.com/Ilmaan-Ahamed/CivicPulse-LK.git
cd CivicPulse-LK
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env.local` file:

```text
.env.local
```

Add the required environment variables for:

```text
Clerk
Database
Gemini API
Mapbox
MinIO
Inngest
```

> **Never commit `.env.local` or API keys to GitHub.**

---

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## 📂 Project Structure

```text
CivicPulse-LK/
│
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── admin/
│   │   ├── ds-office/
│   │   ├── agency/
│   │   ├── ngo/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── unauthorized/
│   │
│   ├── components/
│   ├── data/
│   ├── lib/
│   ├── types/
│   └── middleware.ts
│
├── prisma/
│   └── schema.prisma
│
├── public/
│
├── package.json
├── next.config.*
├── tailwind.config.*
└── README.md

```
## 📡 API Overview

CivicPulse LK provides RESTful API routes for authentication, civic issue reporting, verification, case management, evidence handling, notifications, and public transparency.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/reports` | Submit a new civic infrastructure report | Yes |
| GET | `/api/reports` | List, search, and filter civic reports | No / Role-based |
| GET | `/api/reports/:id` | Get details of a specific report | No / Role-based |
| PUT | `/api/reports/:id` | Update a report | Yes |
| DELETE | `/api/reports/:id` | Delete a report | Yes |
| POST | `/api/reports/:id/verify` | Submit verification for a report | Yes |
| GET | `/api/reports/:id/verifications` | View verification records for a report | Yes |
| PUT | `/api/reports/:id/status` | Update the status of a report | Yes |
| POST | `/api/reports/:id/assign` | Assign a verified report to an agency, NGO, or volunteer team | Yes |
| POST | `/api/reports/:id/evidence` | Upload field verification evidence | Yes |
| GET | `/api/reports/:id/evidence` | Retrieve evidence associated with a report | Yes |
| GET | `/api/dashboard` | Retrieve public dashboard statistics | No |
| GET | `/api/notifications` | Get notifications for the current user | Yes |
| PUT | `/api/notifications/:id/read` | Mark a notification as read | Yes |

---

## 🧪 Development & Testing

The project follows an iterative development approach with separate Git branches:

```text
main
 │
 ├── Development
 │
 └── Testing
```

Testing focuses on the complete civic workflow:

```text
Report
  ↓
Verification
  ↓
DS Office Review
  ↓
Assignment
  ↓
Field Verification
  ↓
Resolution
  ↓
Public Feedback
```
---

## 👨‍💻 Team

### Group 20 — CivicPulse LK

| # | Name                  | Role                                |
| - | --------------------- | ----------------------------------- |
| 1 | **MJ. Ilmaan Ahamed** | Group Leader / Full-Stack Developer |
| 2 | **MM. Afrith**        | Full-Stack Developer                |
| 3 | **RM. Himas**         | Full-Stack Developer                |
| 4 | **ASM. Aasim**        | Full-Stack Developer                |

---


## 📄 License

This project was developed as part of the **Technology Challenge Competition Module (FoCIT) in SLTC University**.

---


## 🔗 Repository

**GitHub:** https://github.com/Ilmaan-Ahamed/CivicPulse-LK
