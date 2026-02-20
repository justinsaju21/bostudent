# Vercel Deployment & Hosting Guide

This guide explains how to host the **BO-Student** portal on a public domain using Vercel.

## 1. Why Vercel?
Vercel is the creator of Next.js. It provides the best hosting experience with:
- **Global CDNs**: Fast loading worldwide.
- **Serverless Functions**: Automatically handles the API routes.
- **Auto-Deployment**: Every time you push code to GitHub, the site updates.

## 2. Preparing for Deployment
Before deploying, ensure you have:
1.  A GitHub repository with your code.
2.  All required environment variables (see below).

## 3. Deployment Steps
1.  Log in to [Vercel](https://vercel.com).
2.  Click **Add New > Project**.
3.  Import your GitHub repository.
4.  **Environment Variables**: During the "Configure Project" step, expand the "Environment Variables" section and add:
    - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
    - `GOOGLE_PRIVATE_KEY` (Paste the full key, Vercel handles the newlines).
    - `GOOGLE_SHEET_ID`
    - `ADMIN_SECRET` (Your chosen password for the faculty dashboard).
5.  Click **Deploy**.

## 4. Domain Mapping
By default, Vercel gives you a URL like `bo-student.vercel.app`. To use a custom domain (e.g., `student-awards.srmist.edu.in`):

1.  In Vercel, go to **Settings > Domains**.
2.  Enter your domain name.
3.  Vercel will give you **A records** or **CNAME records**.
4.  Log in to your Domain Provider (GoDaddy, Namecheap, etc.) and update your DNS settings with these records.
5.  Vercel will automatically generate an **SSL Certificate** (HTTPS) once the DNS propagates.

## 5. Security Notes
- **HTTPS**: Vercel provides this by default. Never run the site on plain HTTP.
- **Private Keys**: Vercel encrypts your environment variables. Never commit your `.env.local` file to GitHub.
- **Admin Password**: Choose a strong `ADMIN_SECRET` as this protects all student data.
