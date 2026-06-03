# RenewalFlow - Full Implementation Plan

## Project Overview

RenewalFlow is a web application for freelancers, agencies, and developers to manage:

* Clients
* Projects
* Domains
* Hosting/Servers
* AMC Contracts
* Invoices
* UPI QR Payments
* Renewal Reminders
* Reports

---

# Tech Stack

## Frontend

* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS
* Shadcn/UI
* React Hook Form
* Zod
* Recharts
* Lucide Icons

## Backend

* Next.js Route Handlers
* Prisma ORM
* PostgreSQL

## Authentication

* Auth.js (NextAuth)

## Additional Services

* PDFKit (Invoice PDF)
* QRCode (UPI QR)
* Nodemailer (Email)
* Cloudinary (File Uploads)

---

# UI Theme

## Theme Type

Light Theme

## Colors

Primary:

* Blue 600

Success:

* Green 600

Warning:

* Amber 500

Danger:

* Red 600

Background:

* White

Card:

* White

Border:

* Gray 200

Text Primary:

* Gray 900

Text Secondary:

* Gray 600

Sidebar:

* White

Hover:

* Gray 100

---

# Application Structure

## Sidebar Navigation

Dashboard

Clients

Projects

Domains

Servers

AMC Contracts

Invoices

Payments

Reports

Settings

---

# Folder Structure

```txt
src

├── app
│   ├── dashboard
│   ├── clients
│   ├── projects
│   ├── domains
│   ├── servers
│   ├── amc
│   ├── invoices
│   ├── payments
│   ├── reports
│   ├── settings
│   └── api
│
├── components
│
├── lib
│
├── hooks
│
├── schemas
│
├── services
│
├── types
│
└── utils
```

---

# Database Design

## User

```sql
id
name
email
password
createdAt
updatedAt
```

## Client

```sql
id
name
companyName
email
phone
address
gstNo
notes
createdAt
updatedAt
```

## Project

```sql
id
clientId
projectName
description
status
createdAt
updatedAt
```

Status

```txt
ACTIVE
INACTIVE
COMPLETED
```

## Domain

```sql
id
projectId
domainName
registrar
purchaseDate
expiryDate
renewalAmount
autoRenew
status
notes
```

Status

```txt
ACTIVE
EXPIRED
RENEWED
```

## Server

```sql
id
projectId
provider
planName
ipAddress
purchaseDate
expiryDate
amount
notes
```

## AMC Contract

```sql
id
projectId
startDate
endDate
amount
renewalCycle
status
notes
```

Renewal Cycle

```txt
MONTHLY
QUARTERLY
YEARLY
```

## Invoice

```sql
id
invoiceNumber
clientId
projectId
invoiceDate
dueDate
amount
description
status
pdfUrl
```

Status

```txt
DRAFT
PENDING
PAID
CANCELLED
```

## Payment

```sql
id
invoiceId
amount
paidDate
transactionRef
proofImage
status
remarks
```

Status

```txt
PENDING
VERIFIED
REJECTED
```

## Reminder

```sql
id
referenceType
referenceId
reminderDate
notificationType
status
```

Reference Type

```txt
DOMAIN
SERVER
AMC
INVOICE
```

---

# Dashboard Module

## Dashboard Cards

* Total Clients
* Total Projects
* Active Domains
* Domains Expiring
* Active Servers
* Servers Expiring
* AMC Expiring
* Pending Invoices
* Revenue This Month

## Dashboard Charts

### Revenue Trend

Monthly revenue graph

### Upcoming Renewals

Domains
Servers
AMC

### Pending Payments

Pending invoice graph

---

# Client Module

## Features

* Add Client
* Edit Client
* Delete Client
* View Client
* Search Client

## Table Columns

* Name
* Company
* Email
* Phone
* Total Projects
* Actions

---

# Project Module

## Features

* Create Project
* Assign Client
* Update Project
* Delete Project
* Project History

## Table Columns

* Project Name
* Client
* Status
* Created Date

---

# Domain Module

## Features

* Add Domain
* Edit Domain
* Delete Domain
* Renewal Tracking

## Table Columns

* Domain Name
* Registrar
* Expiry Date
* Days Left
* Renewal Amount
* Status

## Color Rules

Green:
Active

Orange:
Less than 30 Days

Red:
Less than 7 Days

Dark Red:
Expired

---

# Server Module

## Features

* Add Hosting
* Edit Hosting
* Delete Hosting
* Renewal Tracking

## Table Columns

* Provider
* Plan
* IP Address
* Expiry Date
* Amount

Providers

* Hostinger
* AWS
* DigitalOcean
* Contabo
* Vultr
* Custom

---

# AMC Module

## Features

* Create AMC
* Edit AMC
* Delete AMC

## Columns

* Client
* Project
* Start Date
* End Date
* Amount
* Status

---

# Invoice Module

## Features

* Create Invoice
* Generate PDF
* Download PDF
* Email Invoice

## Invoice Fields

* Invoice Number
* Client
* Project
* Description
* Amount
* Due Date

---

# UPI QR Module

## Settings

Store

* UPI ID
* UPI Name

Example

```txt
sivabharath@upi
```

Generate QR

```txt
upi://pay?pa=sivabharath@upi&pn=Sivabharath&am=1500
```

Display on Invoice

* Amount
* QR Code
* UPI ID
* Payment Instructions

---

# Payment Module

## Workflow

Invoice Created

↓

Client Pays

↓

Client Uploads Screenshot

↓

Admin Reviews

↓

Approve or Reject

## Features

* View Payment Proof
* Approve Payment
* Reject Payment
* Add Remarks

---

# Reminder System

## Daily Scheduler

Runs Every Day

09:00 AM

## Checks

Domains

Servers

AMC Contracts

Invoices

## Reminder Intervals

30 Days

15 Days

7 Days

3 Days

1 Day

Expired

---

# Email Notifications

## Domain Expiry

Subject:
Domain Renewal Reminder

## Server Expiry

Subject:
Hosting Renewal Reminder

## AMC Renewal

Subject:
AMC Renewal Reminder

## Invoice Due

Subject:
Invoice Due Reminder

---

# Reports Module

## Available Reports

Revenue Report

Client Report

Domain Renewal Report

Server Renewal Report

AMC Report

Pending Payments Report

## Export Options

PDF

Excel

CSV

---

# Settings Module

## Company Settings

* Company Name
* Company Logo
* Email
* Phone

## Payment Settings

* UPI ID
* UPI Name

## Reminder Settings

* Reminder Days
* Notification Email

---

# API Structure

## Auth

```txt
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET /api/auth/session
```

## Clients

```txt
GET /api/clients
POST /api/clients
PUT /api/clients/:id
DELETE /api/clients/:id
```

## Projects

```txt
GET /api/projects
POST /api/projects
PUT /api/projects/:id
DELETE /api/projects/:id
```

## Domains

```txt
GET /api/domains
POST /api/domains
PUT /api/domains/:id
DELETE /api/domains/:id
```

## Servers

```txt
GET /api/servers
POST /api/servers
PUT /api/servers/:id
DELETE /api/servers/:id
```

## AMC

```txt
GET /api/amc
POST /api/amc
PUT /api/amc/:id
DELETE /api/amc/:id
```

## Invoices

```txt
GET /api/invoices
POST /api/invoices
PUT /api/invoices/:id
DELETE /api/invoices/:id
```

## Payments

```txt
GET /api/payments
POST /api/payments
PUT /api/payments/:id
```

---

# Development Roadmap

## Week 1

* Project Setup
* Authentication
* Layout
* Sidebar
* Dashboard
* Client CRUD

## Week 2

* Project CRUD
* Domain CRUD
* Server CRUD
* AMC CRUD

## Week 3

* Invoice Module
* PDF Generation
* QR Code Generation
* Payment Module

## Week 4

* Reminder Engine
* Email Notifications
* Reports
* Settings
* Deployment

---

# MVP Completion Checklist

* Authentication
* Dashboard
* Clients
* Projects
* Domains
* Servers
* AMC
* Invoices
* PDF Generation
* UPI QR
* Payment Verification
* Reports
* Email Reminders
* Settings
* Deployment

---

# Future SaaS Features

* Multi User Access
* Team Management
* WhatsApp Notifications
* Domain WHOIS Sync
* Client Portal
* Subscription Billing
* Mobile App
* Dark Theme
* Activity Logs
* Audit History

End of Document
