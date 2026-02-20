# API Reference & Data Flow

This document details the internal API endpoints used by the **BO-Student** portal.

## Base URL
In development: `http://localhost:3000/api`
In production: `https://your-domain.com/api`

---

## 1. Student Submission
**Endpoint**: `POST /api/admin` (Used for initial submission)

- **Request Body**: A full `StudentApplication` object (validated by Zod).
- **Logic**:
    1. Checks for duplicates (Register No, Email, or Mobile).
    2. Appends a new row to `Sheet1`.
    3. Returns Success/Error.

---

## 2. Authentication
**Endpoint**: `POST /api/admin-auth` (Login)
- **Request Body**: `{ password: "..." }`
- **Security**: Compares against `ADMIN_SECRET`. If correct, sets an HTTP-only cookie with a signed HMAC token valid for 8 hours.

**Endpoint**: `DELETE /api/admin-auth` (Logout)
- **Action**: Clears the auth cookie.

---

## 3. Evaluation & Ranking
**Endpoint**: `GET /api/admin` (Fetch All)
- **Action**: Fetches all rows from the spreadsheet.
- **Optimization**: Uses a 30-second server-side cache to prevent hitting Google API rate limits.

**Endpoint**: `POST /api/admin/evaluate` (Update Scores/Discards)
- **Request Body**: 
  ```json
  {
    "regNo": "RA...",
    "facultyScore": 8.5,
    "discardedItems": ["uuid-1", "uuid-2"]
  }
  ```
- **Action**: Locates the student by Register Number and updates only the `Faculty_Score` and `Discarded_Items` columns.

---

## 4. Settings & Deadlines
**Endpoint**: `GET /api/deadline`
- **Action**: Reads the `DEADLINE` key from the `Settings` tab in the spreadsheet.

**Endpoint**: `POST /api/deadline`
- **Request Body**: `{ deadline: "2024-12-31T23:59:59Z" }`
- **Action**: Updates the `Settings` tab.

---

## 5. Developer Tools
**Endpoint**: `POST /api/seed-test-data`
- **Action**: Generates 5–10 random student profiles using `mockData.ts` and pushes them to the sheet.
- **Security**: Only works in development environments.

---

## Data Structure: The "JSON Blob"
While Google Sheets has individual columns for filtering, the project also saves the **entire** student profile as a JSON string in the last column (`JSON_Full_Data`).

### Why use a JSON Blob?
1.  **Data Integrity**: If someone accidentally edits a name in the spreadsheet, the code can recover the original data from the JSON.
2.  **Complexity**: Some fields (like a list of 5 projects with GitHub links and tech stacks) are too complex for a single spreadsheet cell. JSON stores them perfectly.
3.  **Future Proofing**: If we add a new field to the application form tomorrow, it will automatically be saved in the JSON without needing to add a new column to the spreadsheet.
