# DRAPE – Modern Clothing

A full-stack clothing store built with Next.js 14. Browse products, manage a persistent cart, save payment methods with Stripe, and complete one-click checkout with saved cards.

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js v5 (Credentials + optional Google)
- **Payments:** Stripe (SetupIntents, saved cards, off-session PaymentIntents)
- **Validation:** Zod

## Local setup

### Prerequisites

- Node.js 18+
- PostgreSQL (local, [Prisma Postgres](https://www.prisma.io/docs/guides/prisma-orm/quickstart/prisma-postgres), or [Neon](https://neon.tech))

### 1. Clone and install

```bash
git clone git@github.com:rejo132/drape-store.git
cd drape-store
npm install
```

### 2. Environment variables

Copy the example and fill in your values:

```bash
cp .env.local.example .env.local   # or create .env.local manually
```

See the [environment variables](#environment-variables) table below.

### 3. Database setup

```bash
npx prisma db push
npx prisma db seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For local Prisma Postgres:

```bash
npx prisma dev
```

Use the `postgres://` connection string it prints as your `DATABASE_URL`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string. Local: `postgres://...`. Production (Neon): add `?sslmode=require` at the end. |
| `NEXTAUTH_SECRET` | Yes | Random secret for signing JWTs. Generate with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Yes | App base URL. Local: `http://localhost:3000`. Production: your Vercel URL (e.g. `https://drape-store.vercel.app`). |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (`sk_test_...` or `sk_live_...`). **Server-only — never expose to the client.** |
| `STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key (server reference, optional). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key for client-side Elements (`pk_test_...` or `pk_live_...`). |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID (enables Google sign-in when set). |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret. |

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New → Project** and import `rejo132/drape-store`.
3. Add all environment variables from the table above in the Vercel dashboard.
4. For `DATABASE_URL`, use your **Neon production** connection string with `?sslmode=require` appended.
5. Set `NEXTAUTH_URL` to your Vercel deployment URL (e.g. `https://your-app.vercel.app`).
6. Deploy.

### 3. Seed production database

After the first successful deploy, seed products on production:

```bash
npx prisma db seed
```

Ensure `DATABASE_URL` in your shell points at the production Neon database, or pass it via your environment when running the seed.

### 4. Stripe webhooks (optional)

For production, configure Stripe in live mode and update keys in Vercel environment variables.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma db push` | Push schema to database |
| `npx prisma db seed` | Seed sample products |

## Project structure

```
app/                  # Next.js App Router pages and API routes
components/           # UI components (navbar, product cards, checkout)
lib/                  # Auth, cart, Stripe, Prisma, utilities
prisma/               # Schema and seed
types/                # TypeScript declarations
```

## Security notes

- Payment amounts are always recalculated server-side from database prices.
- Payment method ownership is verified before charging.
- Order pages verify the order belongs to the logged-in user.
- `STRIPE_SECRET_KEY` is only used in API routes — never sent to the browser.
