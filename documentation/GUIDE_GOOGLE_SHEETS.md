# Google Cloud & Google Sheets Setup Guide

This guide explains how to set up the "Backend" infrastructure from zero.

## 1. Google Cloud Console Setup
To let the code talk to Google Sheets, you need a **Service Account**.

1.  **Create a Project**: Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project named "BO-Student".
2.  **Enable APIs**: 
    - Search for **Google Sheets API** and click **Enable**.
    - Search for **Google Drive API** and click **Enable** (required for some permission checks).
3.  **Create Credentials**:
    - Go to **APIs & Services > Credentials**.
    - Click **Create Credentials > Service Account**.
    - Give it a name (e.g., "sheet-bot") and click **Create and Continue**.
4.  **Generate a Key**:
    - Click on your new Service Account.
    - Go to the **Keys** tab.
    - Click **Add Key > Create New Key > JSON**.
    - **IMPORTANT**: This downloads a file. Save it safely. Open it to find your `client_email` and `private_key`.

## 2. Google Sheets Configuration
The code doesn't just "access" all your sheets; you have to invite it.

1.  **Create a New Spreadsheet**: Name it "BO Student Database".
2.  **Get the ID**: Look at the URL. It looks like `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit`. Copy that ID.
3.  **Share the Sheet**:
    - Click the **Share** button in the top right.
    - Paste the `client_email` from your JSON key file (e.g., `sheet-bot@project-123.iam.gserviceaccount.com`).
    - Set the role to **Editor**.
    - Uncheck "Notify people" and click **Send**.

## 3. Initializing the Database
The sheet needs specific columns to work. We have a script for this.

1.  Ensure your `.env.local` has the `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY`.
2.  Run the initialization script:
    ```bash
    npx ts-node scripts/init-sheet.ts
    ```
3.  This will create two tabs:
    - **Sheet1**: For student applications.
    - **Settings**: For things like the application deadline.

## 4. Troubleshooting
- **Permission Denied**: Double-check that you shared the sheet with the Service Account email.
- **Invalid Private Key**: Ensure the private key in your environment variables includes the `\n` characters for newlines.
