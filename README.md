📦 QuickDrop - an application with Next.js, Clerk, Drizzle, and ImageKit

A full-stack Dropbox-like file management system built with the modern web stack: **Next.js App Router**, **Clerk for auth**, **Zod for validation**, **Drizzle ORM** with **Neon Postgres**, and **ImageKit** for file storage.

---

## 🔥 Features

- 📝 **User Auth** – Signup, Signin with OTP using Clerk
- ✅ **Form Validation** – Zod + React Hook Form integration
- 📂 **Folder & File Management** – Create folders, upload files, nested structures
- ⭐ **Mark as Starred / Deleted** – Manage file states in the database
- ☁️ **ImageKit Integration** – Upload any type of file to the cloud
- 🔐 **API Middleware** – Protect routes and APIs with Clerk middleware
- 🧾 **Postgres with Drizzle ORM** – Clean schema and relational data handling
- 🎨 **HeroUI Components** – Elegant and reusable UI design

---

## 🛠️ Tech Stack

| Tech            | Description                            |
|-----------------|----------------------------------------|
| Next.js 14+     | React Framework with App Router        |
| Clerk           | Auth with OTP, session management      |
| Zod             | Schema validation for forms            |
| React Hook Form | Powerful form handling                 |
| Drizzle ORM     | Type-safe SQL ORM for Postgres         |
| Neon            | Serverless Postgres DB                 |
| ImageKit        | File and image storage solution        |
| HeroUI          | Accessible Tailwind UI components      |

---

## 📁 Folder Structure

```
/app
  /dashboard
  /api
  /auth
  layout.tsx
/db
  schema.ts
  drizzle.config.ts
/lib
  utils.ts
  auth.ts
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/yourusername/QuickDrop.git
cd QuickDrop

# Install dependencies
npm install

# Copy and set environment variables
cp .env.example .env.local
# Add your Clerk, ImageKit, and Neon DB credentials

# Push DB schema
npx drizzle-kit push

# Run the app
npm run dev
```

---


## 🧠 What You’ll Learn

- Real-world **file upload** and **folder structure** modeling
- Full-stack **authentication flows** with OTP
- Deep **form validation** and error handling
- Advanced **API route protection**
- How SaaS apps like Dropbox handle file data and cloud storage
- Clean, scalable project architecture


## 🙌 Credits

This project is inspired by modern file management SaaS like **Dropbox**, and built as a learning project using the best tools of the JavaScript ecosystem.

---

## 📄 License

MIT