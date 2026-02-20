# Technology Stack & Core Terminology

This document explains the "human side" of the code—what the tools are and why they were chosen for the **BO-Student** project.

## 1. Core Framework: Next.js (Version 16.1.6)
Next.js is the "skeleton" of the application. It is a React-based framework that handles:
- **Routing**: Automatically creating pages based on files in the `src/app` folder.
- **Server Components**: Allowing the app to fetch data from the database securely on the server before showing it to the user.
- **Fast Refresh**: Instant updates during development.

## 2. Server Runtime: Node.js
Node.js is the environment that allows JavaScript to run on a computer or server (like Vercel). It is the engine that executes all the logic behind the scenes, such as connecting to Google APIs or calculating student scores.

## 3. Programming Language: TypeScript
TypeScript is "JavaScript with rules." It ensures that a "Register Number" is always a text string and a "CGPA" is always a number. This prevents common bugs and makes the code much easier to maintain.

## 4. UI Library: React (Version 19.2.3)
React is used to build the "UI components" (buttons, forms, cards). It allows us to create interactive pieces of the website that update instantly without refreshing the page.

## 5. Styling: Tailwind CSS (Version 4.x)
Tailwind is a "utility-first" CSS framework. Instead of writing long CSS files, we apply styles directly to the HTML using classes like `bg-blue-600` (for background color) or `p-4` (for padding). 
- **Glassmorphism**: We used Tailwind to create the "frosted glass" look (cards with translucent backgrounds) that gives the site its premium feel.

## 6. Animations: Framer Motion
This is used for high-end UI transitions. Whenever a section "fades in" as you scroll or a modal pops up smoothly, Framer Motion is doing the work.

## 7. Data Validation: Zod & React Hook Form
- **Zod**: Defines "Schemas" (rules) for data. For example, it checks that an SRM email actually ends in `@srmist.edu.in`.
- **React Hook Form**: Manages the massive 20-step application form, ensuring it is fast and only submits when every rule is followed.

## 8. Database: Google Sheets (via Googleapis)
Instead of a complex SQL database, this project uses a standard Google Spreadsheet. 
- **Why?**: It is free, extremely easy for faculty to view manually, and requires zero maintenance.
- **How?**: We use the official `googleapis` library to "read" and "write" rows just like a normal database.

## 9. Icons: Lucide React
A collection of clean, professional icons (like the graduation cap or trophy) used throughout the site.
