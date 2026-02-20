# BO-Student — Best Outgoing Student Award Portal

> A comprehensive digital platform for **SRM Institute of Science and Technology** to evaluate and rank graduating students for the "Best Outgoing Student" award. Replaces manual evaluation with a transparent, algorithm-driven 360° assessment.

---

> [!IMPORTANT]
> **Complete "0 to Everything" Documentation**: For a deep-dive into the technical stack, Google Cloud setup, Vercel deployment, system architecture, and API details, please see the [**documentation/**](./documentation/README.md) folder.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Scoring & Weightage System (100 Points)](#scoring--weightage-system-100-points)
4. [Detailed Category Breakdown](#detailed-category-breakdown)
5. [Scoring Functions & Formulas](#scoring-functions--formulas)
6. [Worked Example](#worked-example)
7. [Admin & Faculty Features](#admin--faculty-features)
8. [Application Form Sections](#application-form-sections)
9. [Database Schema (Google Sheets)](#database-schema-google-sheets)
10. [API Routes](#api-routes)
11. [Authentication](#authentication)
12. [Environment Variables](#environment-variables)
13. [Setup Guide](#setup-guide)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5.x |
| UI | React | 19.2.3 |
| Styling | Tailwind CSS | 4.x |
| Animations | Framer Motion | 12.34.0 |
| Forms | React Hook Form + Zod | 7.71.1 / 4.3.6 |
| Icons | Lucide React | 0.564.0 |
| Database | Google Sheets API | googleapis 171.4.0 |
| Auth | HMAC-SHA256 JWT tokens | Custom (crypto) |

---

## Project Structure

```
bo-student/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page (Hero, Features, How It Works)
│   │   ├── apply/page.tsx        # Multi-step student application form
│   │   ├── [reg_no]/             # Student portfolio view
│   │   │   ├── page.tsx          # Server component (data fetching)
│   │   │   └── PortfolioClient.tsx  # Client-side portfolio renderer
│   │   ├── admin/
│   │   │   ├── page.tsx          # Admin dashboard (server component)
│   │   │   ├── AdminClient.tsx   # Full admin UI (1219 lines)
│   │   │   └── login/page.tsx    # Admin login page
│   │   ├── api/
│   │   │   ├── admin/            # Admin data API
│   │   │   ├── admin-auth/       # Login/logout endpoints
│   │   │   ├── deadline/         # Deadline management
│   │   │   └── seed-test-data/   # Test data seeding
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Design system (glassmorphism, gradients)
│   │   ├── actions.ts            # Server actions
│   │   └── not-found.tsx         # Custom 404
│   ├── components/
│   │   ├── FormSteps.tsx         # Multi-step form (53,673 bytes)
│   │   ├── Navbar.tsx            # Navigation bar
│   │   ├── ComparisonModal.tsx   # Side-by-side student comparison
│   │   └── SearchableSelect.tsx  # Autocomplete dropdown
│   └── lib/
│       ├── ranking.ts            # ⭐ Scoring algorithm & weightage
│       ├── schemas.ts            # Zod validation schemas
│       ├── types.ts              # TypeScript interfaces
│       ├── googleSheets.ts       # Google Sheets CRUD layer
│       ├── adminAuth.ts          # HMAC token auth
│       ├── mockData.ts           # Test data generator
│       └── utils.ts              # Utility functions
└── scripts/
    ├── init-sheet.ts             # Sheet header initializer
    └── download-logo.js          # Logo downloader
```

---

## Scoring & Weightage System (100 Points)

The algorithm in `src/lib/ranking.ts` evaluates students across **15 categories** totalling **100 points**.

### Master Weightage Table

| # | Category | Max Points | Max Items | Scoring Method |
|---|----------|-----------|-----------|----------------|
| 1 | **CGPA** | **18** | — | Normalized (CGPA ÷ 10) |
| 2 | **Research & Publications** | **12** | 5 | Index + Publication bonus |
| 3 | **Internships** | **10** | 5 | Item count (linear) |
| 4 | **Projects** | **10** | 5 | Item count (linear) |
| 5 | **Hackathons** | **8** | 5 | Item count (linear) |
| 6 | **Entrepreneurship** | **8** | 3 | Item count (linear) |
| 7 | **Certifications** | **5** | 5 | Item count (linear) |
| 8 | **Competitive Exams** | **5** | 3 | Item count (linear) |
| 9 | **Sports & Cultural** | **5** | 5 | Level-based multiplier |
| 10 | **Volunteering** | **5** | 5 | Item count (linear) |
| 11 | **Scholarships** | **4** | 3 | Item count (linear) |
| 12 | **Club Activities** | **4** | 5 | Item count (linear) |
| 13 | **Dept Contributions** | **2** | 5 | Item count (linear) |
| 14 | **Professional Memberships** | **2** | 5 | Item count (linear) |
| 15 | **References** | **2** | 3 | Item count (linear) |
| | **TOTAL** | **100** | | |

---

## Detailed Category Breakdown

### 1. CGPA (18 points)

```
Formula:  score = (CGPA ÷ 10) × 18
Penalty:  If historyOfArrears = true → score × 0.85 (15% deduction)
```

| CGPA | No Arrears | With Arrears |
|------|-----------|--------------|
| 10.0 | 18.00 | 15.30 |
| 9.5 | 17.10 | 14.54 |
| 9.0 | 16.20 | 13.77 |
| 8.5 | 15.30 | 13.01 |
| 8.0 | 14.40 | 12.24 |
| 7.0 | 12.60 | 10.71 |

---

### 2. Research & Publications (12 points)

Each paper starts with a **base score of 0.5**, then gets bonuses:

**Index Status Bonus:**

| Index | Bonus | Total (base + bonus) |
|-------|-------|---------------------|
| SCI | +0.4 | 0.9 |
| Scopus | +0.3 | 0.8 |
| UGC Care | +0.2 | 0.7 |
| Other | +0.0 | 0.5 |
| None | +0.0 | 0.5 |

**Publication Status Bonus (stacks with index):**

| Status | Bonus |
|--------|-------|
| Granted (Patent) | +0.3 |
| Published | +0.2 |
| Filed | +0.0 |
| Under Review | +0.0 |

**Formula:**
```
Per paper score = min(base + indexBonus + pubBonus, 1.0)
Total normalized = sum(per paper scores) ÷ 5
Final score = normalized × 12
```

**Example:** 2 SCI Published papers = `((0.5+0.4+0.2) + (0.5+0.4+0.2)) ÷ 5 = 2.0 ÷ 5 = 0.4` → `0.4 × 12 = 4.80 pts`

---

### 3. Internships (10 points)

```
Formula:  score = min(count, 5) ÷ 5 × 10
```

| Internships | Score |
|-------------|-------|
| 0 | 0.00 |
| 1 | 2.00 |
| 2 | 4.00 |
| 3 | 6.00 |
| 4 | 8.00 |
| 5+ | 10.00 |

---

### 4. Projects (10 points)

```
Formula:  score = min(count, 5) ÷ 5 × 10
```

Same scaling as Internships. 5 projects = full 10 points.

---

### 5. Hackathons (8 points)

```
Formula:  score = min(count, 5) ÷ 5 × 8
```

| Hackathons | Score |
|------------|-------|
| 0 | 0.00 |
| 1 | 1.60 |
| 2 | 3.20 |
| 3 | 4.80 |
| 5+ | 8.00 |

---

### 6. Entrepreneurship (8 points)

```
Formula:  score = min(count, 3) ÷ 3 × 8
Max items capped at 3 (not 5)
```

| Startups | Score |
|----------|-------|
| 0 | 0.00 |
| 1 | 2.67 |
| 2 | 5.33 |
| 3+ | 8.00 |

---

### 7. Certifications (5 points)

```
Formula:  score = min(count, 5) ÷ 5 × 5
```

| Certifications | Score |
|----------------|-------|
| 1 | 1.00 |
| 3 | 3.00 |
| 5+ | 5.00 |

---

### 8. Competitive Exams (5 points)

```
Formula:  score = min(count, 3) ÷ 3 × 5
Max items capped at 3
```

| Exams | Score |
|-------|-------|
| 1 | 1.67 |
| 2 | 3.33 |
| 3+ | 5.00 |

---

### 9. Sports & Cultural (5 points)

Each event is scored based on **competition level**, not just count:

| Level | Multiplier |
|-------|-----------|
| International | 1.0 |
| National | 0.9 |
| State | 0.75 |
| District | 0.6 |
| Zone | 0.4 |
| Other/Unknown | 0.3 |

```
Formula:  total = sum(multipliers for up to 5 events) ÷ 5
Final score = min(total, 1.0) × 5
```

**Example:** 1 National + 1 State = `(0.9 + 0.75) ÷ 5 = 0.33` → `0.33 × 5 = 1.65 pts`

---

### 10. Volunteering (5 points)

```
Formula:  score = min(count, 5) ÷ 5 × 5
```

---

### 11. Scholarships (4 points)

```
Formula:  score = min(count, 3) ÷ 3 × 4
Max items capped at 3
```

---

### 12. Club Activities (4 points)

```
Formula:  score = min(count, 5) ÷ 5 × 4
```

---

### 13. Department Contributions (2 points)

```
Formula:  score = min(count, 5) ÷ 5 × 2
```

---

### 14. Professional Memberships (2 points)

```
Formula:  score = min(count, 5) ÷ 5 × 2
```

---

### 15. References (2 points)

```
Formula:  score = min(count, 3) ÷ 3 × 2
Max items capped at 3
```

---

## Scoring Functions & Formulas

### Generic List Scoring (`scoreListItems`)
```
scoreListItems(items, maxItems = 5) = min(count, maxItems) ÷ maxItems
```
Returns a value between 0 and 1, which is then multiplied by the category weight.

### CGPA Scoring (`scoreCGPA`)
```
scoreCGPA(cgpa) = min(cgpa ÷ 10, 1)
If arrears: result × 0.85
```

### Research Scoring (`scoreResearch`)
```
For each paper (up to 5):
  itemScore = 0.5 (base)
  + indexBonus (SCI=0.4, Scopus=0.3, UGC=0.2)
  + pubBonus (granted=0.3, published=0.2)
  itemScore = min(itemScore, 1.0)

Total = sum(itemScores) ÷ 5
```

### Sports Scoring (`scoreSportsOrCultural`)
```
For each event (up to 5):
  Use level multiplier lookup table
Total = min(sum(multipliers) ÷ 5, 1.0)
```

### Final Score Calculation
```
totalScore = Σ (categoryNormalizedScore × categoryWeight)
           for all 15 categories

All values are rounded to 2 decimal places.
```

---

## Worked Example

**Student Profile:**
- CGPA: 9.2, No arrears
- 3 internships
- 4 projects
- 2 hackathons
- 1 SCI Published paper
- 1 startup
- 3 certifications
- 1 GATE exam
- 1 National sports event
- 2 volunteering activities
- 1 scholarship
- 1 club position
- 0 dept contributions
- 1 IEEE membership
- 2 references

**Calculation:**

| Category | Formula | Score |
|----------|---------|-------|
| CGPA | (9.2 ÷ 10) × 18 | **16.56** |
| Research | ((0.5+0.4+0.2) ÷ 5) × 12 | **2.64** |
| Internships | (3 ÷ 5) × 10 | **6.00** |
| Projects | (4 ÷ 5) × 10 | **8.00** |
| Hackathons | (2 ÷ 5) × 8 | **3.20** |
| Entrepreneurship | (1 ÷ 3) × 8 | **2.67** |
| Certifications | (3 ÷ 5) × 5 | **3.00** |
| Competitive Exams | (1 ÷ 3) × 5 | **1.67** |
| Sports | (0.9 ÷ 5) × 5 | **0.90** |
| Volunteering | (2 ÷ 5) × 5 | **2.00** |
| Scholarships | (1 ÷ 3) × 4 | **1.33** |
| Club Activities | (1 ÷ 5) × 4 | **0.80** |
| Dept Contributions | (0 ÷ 5) × 2 | **0.00** |
| Prof Memberships | (1 ÷ 5) × 2 | **0.40** |
| References | (2 ÷ 3) × 2 | **1.33** |
| **TOTAL** | | **50.50 / 100** |

---

## Admin & Faculty Features

The admin dashboard (`AdminClient.tsx`, 1219 lines) provides:

| Feature | Description |
|---------|-------------|
| **Ranked Leaderboard** | All students sorted by algorithmic score |
| **Student Deep Dive** | Expand any student to see full portfolio with proof links |
| **Discard System** | Toggle individual items as "discarded" (e.g., fake proof) — score recalculates in real-time |
| **Faculty Score Override** | Manually assign a faculty evaluation score |
| **Side-by-Side Comparison** | Compare two students head-to-head via `ComparisonModal.tsx` |
| **CSV Export** | Download all student data as a CSV file |
| **Deadline Management** | Set/update application deadline from the dashboard |
| **Batch Save** | Save all pending changes (discards, scores) in one API call |
| **Search & Filter** | Filter students by name or register number |
| **Lazy Loading** | Progressive loading of student cards for performance |

---

## Application Form Sections

The multi-step form (`FormSteps.tsx`) collects data in these sections:

| Step | Section | Key Fields |
|------|---------|------------|
| 1 | Personal Details | Name, Register No (RA format), Department, Specialization, SRM Email, Mobile, Faculty Advisor, Section |
| 2 | Academic Record | CGPA (0-10), 10th %, 12th %, History of Arrears, Number of Arrears |
| 3 | Post-College Status | Placed / Higher Studies / Entrepreneur / Other, with relevant details |
| 4 | Internships | Company, Role, Start/End Date, Certificate Link, Description |
| 5 | Projects | Title, Description, Tech Stack, GitHub, Deployed & Proof Links |
| 6 | Hackathons | Name, Project Built, Team Size, Position, Proof Link |
| 7 | Research | Title, Journal/Conference, Index Status (SCI/Scopus/UGC/Other/None), Publication Status |
| 8 | Entrepreneurship | Startup Name, Registration Details, Revenue/Funding Status |
| 9 | Certifications | Provider, Certificate Name, Validation ID, Proof Link |
| 10 | Competitive Exams | Exam Name, Score/Rank, Proof Link |
| 11 | Sports & Cultural | Event Name, Level (Zone → International), Position Won |
| 12 | Volunteering | Organization, Role, Hours Served, Impact Description |
| 13 | Scholarships | Name, Awarding Body, Amount/Prestige |
| 14 | Club Activities | Club Name, Position, Key Events Organized, Impact |
| 15 | Dept Contributions | Event Name, Role, Contribution Description |
| 16 | Professional Memberships | Organization (IEEE/ACM etc.), Membership ID, Role |
| 17 | References | Faculty Name, Contact, LOR Link |
| 18 | Social Media | LinkedIn, GitHub, X, Instagram, Website, Custom Others |
| 19 | Future Goals | Free-text description (min 20 chars) |
| 20 | Final | Video Pitch URL, Master Proof Folder URL, Consent Checkbox |

---

## Database Schema (Google Sheets)

### Sheet1 — Student Applications (37 columns)

| # | Column Header | Data Type |
|---|---------------|-----------|
| 1 | Name | String |
| 2 | Register Number | String (RA format) |
| 3 | Department | String |
| 4 | Specialization | String |
| 5 | Section | String |
| 6 | Faculty Advisor | String |
| 7 | Personal Email | Email |
| 8 | SRM Email | Email (@srmist.edu.in) |
| 9 | Mobile Number | String (10-15 digits) |
| 10 | Profile Photo URL | URL |
| 11 | CGPA | Number (0-10) |
| 12 | 10th % | Number (0-100) |
| 13 | 12th % | Number (0-100) |
| 14 | Arrears History | "Yes (N)" or "No" |
| 15 | Post-College Status | Enum string |
| 16 | Post-College Details | Summary string |
| 17-29 | [Category] (Summary) | Human-readable summaries |
| 30 | Future Goal | String |
| 31 | Video Pitch URL | URL |
| 32 | Master Proof Folder | URL |
| 33 | Submitted At | ISO timestamp |
| 34 | Faculty_Score | Number (admin-set) |
| 35 | Discarded_Items | JSON array of item IDs |
| 36 | JSON_Full_Data | Full `StudentApplication` JSON |

### Settings Sheet

| Key | Value |
|-----|-------|
| DEADLINE | ISO date string |

### Caching Layer
- 30-second TTL cache (`_studentsCache`)
- Auto-invalidation on any write operation (submit, update, discard)
- Chunked batch writes (100 rows per API call)

---

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/admin` | Submit application / Get all students |
| POST | `/api/admin-auth` | Admin login (password verification) |
| DELETE | `/api/admin-auth` | Admin logout |
| GET | `/api/deadline` | Get current deadline |
| POST | `/api/deadline` | Set/update deadline |
| POST | `/api/seed-test-data` | Seed mock student data |

### Duplicate Prevention
Before accepting a submission, the API checks for existing entries matching:
- Register Number (case-insensitive)
- Personal Email OR SRM Email
- Mobile Number

---

## Authentication

| Property | Value |
|----------|-------|
| Method | HMAC-SHA256 signed tokens |
| Token Format | `{timestamp}.{signature}` |
| Expiry | 8 hours |
| Storage | HTTP-only cookie |
| Secret | `ADMIN_SECRET` env var |

---

## Environment Variables

```bash
# Google Sheets API
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-spreadsheet-id

# Admin Authentication
ADMIN_SECRET=your-secret-password
```

---

## Setup Guide

1. **Clone the repo** and run `npm install`
2. **Create a Google Cloud Service Account** with Sheets API enabled
3. **Share the target Google Sheet** with the service account email (Editor access)
4. **Copy `.env.local.example`** to `.env.local` and fill in credentials
5. **Initialize the sheet**: `npx ts-node scripts/init-sheet.ts`
6. **Start development**: `npm run dev`
7. **Access**:
   - Student form: `http://localhost:3000/apply`
   - Admin dashboard: `http://localhost:3000/admin`
   - Student portfolio: `http://localhost:3000/{register-number}`
