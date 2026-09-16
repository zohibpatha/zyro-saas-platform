# Zyro — Restaurant Digital Presence Platform

Multi-tenant SaaS platform that gives restaurants a permanent professional digital page with QR-driven Google Review funneling.

---

## Overview

**Zyro** provides restaurants with a high-converting, mobile-optimized digital presence. Each restaurant receives a dedicated public page reachable via a custom slug and branded QR code. The platform features an administrative portal for managing tenant accounts and a self-serve dashboard where restaurant owners can update business information, social and navigation links, brand colors, and showcase dish photo galleries.

### Key Features

- 📱 **Public Digital Page (`/r/[slug]`)**: Sleek, mobile-first profile featuring restaurant branding, customizable accent colors, quick-action buttons (Call, WhatsApp, Maps, Website, Instagram), and food photo carousel.
- ⭐ **Google Review Funneling**: High-prominence Call-to-Action engineered to maximize 5-star customer reviews on Google Maps.
- 🔲 **Branded QR Code Generator**: Generates clean QR codes for tabletop collateral, window decals, and receipts with download support.
- 🛠️ **Owner Dashboard (`/dashboard`)**: Secure self-service portal allowing restaurant owners to manage profile details, contact information, social links, and food photography.
- 👑 **Admin Console (`/admin`)**: Centralized administration for platform operators to provision restaurants, assign owner emails, and toggle active statuses.
- 🔒 **Enterprise-Grade Security**: Supabase Row Level Security (RLS) guarantees data isolation across tenants and administrators.

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth, Storage)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **QR Code Engine**: `qrcode.react`

---

## Getting Started

### Prerequisites

- **Node.js**: v18.18.0 or higher
- **npm**: v9.0.0 or higher
- **Supabase Account**: A free project at [supabase.com](https://supabase.com)

---

### 1. Clone and Install

```bash
cd zyro
npm install
```

---

### 2. Set Up Supabase

1. Create a new project at [https://supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and execute the contents of [`supabase/schema.sql`](supabase/schema.sql). This script will:
   - Create tables: `public.restaurants`, `public.food_photos`, and `public.admin_users`
   - Configure indexes and automatic `updated_at` triggers
   - Enable Row Level Security (RLS) with fine-grained access policies
   - Set up the public `restaurant-assets` storage bucket with upload and read policies
4. Navigate to **Authentication** > **URL Configuration** in your Supabase dashboard:
   - Set **Site URL** to `http://localhost:3000` (or your production deployment URL)
   - Add `http://localhost:3000/auth/callback` to **Redirect URLs** (also add your production domain callback if deploying)

---

### 3. Environment Variables

Create a `.env.local` file by copying `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Fill in your project credentials from **Project Settings** > **API** in Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

### 4. Create First Admin User

To grant an account administrative access to the platform, insert their email address into the `admin_users` table via the Supabase SQL Editor:

```sql
INSERT INTO public.admin_users (email)
VALUES ('your-email@example.com');
```

When this user signs in with a magic link via `/login`, they will be granted access to the `/admin` portal.

---

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Public Landing / Demo**: `http://localhost:3000`
- **Owner Dashboard**: `http://localhost:3000/dashboard`
- **Admin Management**: `http://localhost:3000/admin`
- **Authentication**: `http://localhost:3000/login`

---

### 6. Deploy to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project into [Vercel](https://vercel.com).
3. Configure the environment variables in the Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (e.g. `https://your-domain.vercel.app`)
4. Deploy the project.
5. In your Supabase Dashboard under **Authentication** > **URL Configuration**, add your Vercel deployment URL to **Site URL** and `https://your-domain.vercel.app/auth/callback` to **Redirect URLs**.

---

## Project Structure

```text
zyro/
├── public/                     # Static assets
├── src/
│   ├── actions/                # Next.js Server Actions
│   │   ├── auth.ts             # Sign in, sign out, auth callback handlers
│   │   └── restaurant.ts       # Restaurant CRUD & food photo operations
│   ├── app/                    # Next.js 15 App Router
│   │   ├── admin/              # Admin Console
│   │   │   ├── create/         # Provision new restaurant
│   │   │   ├── edit/[id]/      # Edit restaurant settings
│   │   │   ├── layout.tsx      # Admin guard layout (checks admin_users)
│   │   │   └── page.tsx        # Admin restaurant list & analytics overview
│   │   ├── auth/
│   │   │   └── callback/       # OAuth & Magic Link callback route handler
│   │   ├── dashboard/          # Owner Dashboard
│   │   │   ├── layout.tsx      # Owner guard layout (verifies ownership)
│   │   │   └── page.tsx        # Restaurant profile & photo manager
│   │   ├── login/              # Passwordless authentication page
│   │   ├── r/[slug]/           # Public digital restaurant page
│   │   ├── globals.css         # Tailwind global styles & CSS variables
│   │   ├── layout.tsx          # Root HTML layout & font definitions
│   │   └── page.tsx            # Marketing landing page
│   ├── components/             # React UI components
│   │   ├── ui/                 # shadcn/ui primitives (button, card, dialog, etc.)
│   │   ├── food-photos-manager.tsx # Drag/order and photo upload gallery
│   │   ├── image-upload.tsx    # Supabase storage image uploader
│   │   ├── navbar.tsx          # Authenticated top navigation bar
│   │   ├── public-page-content.tsx # Public restaurant page rendering
│   │   ├── qr-code-generator.tsx   # QR code visualizer & download utility
│   │   ├── restaurant-card.tsx # Summary card for admin restaurant listing
│   │   └── restaurant-form.tsx # Comprehensive restaurant form with validation
│   └── lib/                    # Shared utilities and configurations
│       ├── supabase/           # Supabase client instances
│       │   ├── client.ts       # Browser client (for Client Components)
│       │   ├── middleware.ts   # Edge session refresher
│       │   └── server.ts       # Async server client (for Server Components & Actions)
│       ├── types.ts            # TypeScript interfaces (Restaurant, FoodPhoto, AdminUser)
│       └── utils.ts            # Utility functions (cn helper)
├── supabase/
│   └── schema.sql              # Database migrations, RLS policies, storage bucket setup
├── .env.local.example          # Sample environment variables
├── components.json             # shadcn/ui configuration
├── middleware.ts               # Next.js middleware for session persistence
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies and npm scripts
├── tailwind.config.ts          # Tailwind CSS theme and plugin configuration
└── tsconfig.json               # TypeScript compiler configuration
```

---

## Environment Variables

| Variable | Description | Required | Example |
|---|---|:---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project API URL | Yes | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Public Anonymous API Key | Yes | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_SITE_URL` | Base public URL of your application | Yes | `http://localhost:3000` or `https://zyro.app` |

---

## Security Architecture

1. **Row Level Security (RLS)**:
   - Every database table has RLS strictly enforced.
   - Unauthenticated visitors can only query active restaurants (`is_active = true`) and their associated food photos.
   - Restaurant owners can only query and mutate records matching their authenticated email (`owner_email = auth.jwt() ->> 'email'`).
   - Admins verified against the `admin_users` table have full read and write permissions across all records.

2. **Server-Side Session Validation**:
   - All server components and server actions authenticate users using `supabase.auth.getUser()`, which validates the JWT directly with the Supabase Auth server, avoiding spoofed client sessions.

3. **Storage Security**:
   - Storage uploads to `restaurant-assets` are restricted to authenticated users.
   - File size limits (5MB) and allowed MIME types (`image/png`, `image/jpeg`, `image/webp`) are enforced at the storage engine level.

4. **Zero Service Role Exposure**:
   - No secret or service-role keys are bundled in client-side builds. All privileged actions are mediated through verified user context and Postgres RLS.
