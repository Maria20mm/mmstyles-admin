# MMStyles Admin

Next.js admin panel for collections, products, orders, and customers.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Fill `.env` with your real keys and DB URL.

4. Run dev server:

```bash
npm run dev
```

## Production Env Values

Use these values for production:

- `DEMO_MODE=false`
- `SKIP_AUTH=false`
- `MONGODB_DB_NAME=MMSTYLES_ADMIN` (or your target DB)
- `MONGODB_URL` as a working production string
  - If SRV DNS causes issues, use a non-SRV `mongodb://host1,host2,host3/...` URI.

## Deploy Free on Vercel

1. Push this repo to GitHub.
2. Go to Vercel and import the repo.
3. Add all env vars from `.env.example` in Vercel Project Settings -> Environment Variables.
4. Deploy.

After deploy, configure integrations:

1. Clerk:
   - Add your Vercel domain in allowed origins/redirect URLs.
2. MongoDB Atlas:
   - Add network access rule for Vercel (temporary `0.0.0.0/0` if needed, then tighten).
3. Cloudinary:
   - Ensure your upload preset is unsigned and allowed for browser uploads.

## Verify Deployment

After first deploy, test:

- `/products`
- `/collections`
- `/orders`
- `/customers`
- create/update/delete flows for products and collections

If data is missing, check:

1. `DEMO_MODE` is false in Vercel.
2. DB URL points to the expected cluster/database.
3. Clerk keys are correct for production.
