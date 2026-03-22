# QuickDrop

QuickDrop is a full-stack file workspace built with Next.js App Router, Clerk, Drizzle, Neon Postgres, and ImageKit.

## Features

- Email/password sign up and sign in with Clerk verification
- Protected dashboard with nested folders and breadcrumb navigation
- Cloud file uploads backed by ImageKit
- Starred items and trash/restore flows
- Permanent delete with best-effort ImageKit cleanup
- Drizzle schema and migration support for Neon Postgres

## Stack

- Next.js 15
- React 19
- Clerk
- Drizzle ORM
- Neon Postgres
- ImageKit
- Tailwind CSS 4
- HeroUI

## Environment

Copy `.env.example` to `.env` and provide:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`

## Local setup

```bash
npm install
npm run db:migrate
npm run dev
```

If this is a fresh database and you want Drizzle to generate future migrations from schema changes:

```bash
npm run db:generate
```

## Useful scripts

- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:push`
- `npm run db:studio`

## Notes

- The latest migration adds `storage_id` to the `files` table so uploaded files can be deleted from ImageKit later.
- Existing records without `storage_id` will still work in the UI, but permanent delete can only clean up remote assets when that value exists.
