# Kitchen Companion — Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New project", give it a name (e.g. "kitchen-companion")
3. Choose a region close to you
4. Wait for the project to finish provisioning (~2 min)

## 2. Run the Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the contents of `supabase/schema.sql` and paste it in
4. Click "Run"

## 3. Configure Magic Link Auth

1. In Supabase, go to **Authentication → URL Configuration**
2. Set **Site URL** to your production URL (e.g. `https://your-app.vercel.app`)
3. Under **Redirect URLs**, add:
   - `http://localhost:5173` (for local development)
   - `https://your-app.vercel.app` (for production, add after deploying)

## 4. Get Your Credentials

1. In Supabase, go to **Settings → API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

## 5. Configure the App

Create a `.env` file in the `kitchen-companion/` folder:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Then restart the dev server: `npm run dev`

## 6. Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → "Add New Project"
3. Import your GitHub repo
4. Set **Root Directory** to `kitchen-companion`
5. Add environment variables (same as `.env` above)
6. Deploy

After deploying, add the Vercel URL to Supabase's Redirect URLs (step 3).

## 7. Sign In

Open the app → enter your email → check your inbox → click the magic link → done.
On each new device, repeat this step once. The session persists permanently.

## PWA — Add to Home Screen (Optional)

On iPhone: open the app in Safari → tap the Share button → "Add to Home Screen"
On Android: tap the browser menu → "Add to Home Screen" or "Install app"
