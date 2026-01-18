# Supabase Setup Guide

This guide will help you set up Supabase for WeGoWhen to enable real-time database persistence and sharing across devices.

## Prerequisites

- A [Supabase](https://supabase.com) account (free tier available)

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: WeGoWhen (or any name you prefer)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
4. Click "Create new project" and wait for it to initialize (takes ~2 minutes)

## Step 2: Set Up Database Tables

1. In your Supabase project dashboard, click on the **SQL Editor** in the left sidebar
2. Click "New Query"
3. Copy and paste the entire contents of `supabase-schema.sql` from this repository
4. Click "Run" to execute the SQL
5. You should see success messages confirming the tables and policies were created

## Step 3: Get Your API Credentials

1. In your Supabase project, click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll need two values:
   - **Project URL** - under "Project URL"
   - **Anon/Public Key** - under "Project API keys" → "anon public"

## Step 4: Configure Your Application

### For Local Development

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### For GitHub Pages Deployment

1. Go to your GitHub repository settings
2. Navigate to **Secrets and variables** → **Actions**
3. Click "New repository secret"
4. Add two secrets:
   - **Name**: `VITE_SUPABASE_URL`, **Value**: Your Supabase project URL
   - **Name**: `VITE_SUPABASE_ANON_KEY`, **Value**: Your Supabase anon key

5. Update `.github/workflows/deploy.yml` to include environment variables in the build step:
   ```yaml
   - name: Build
     env:
       VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
       VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
     run: npm run build
   ```

6. Commit and push the workflow change to trigger a new deployment

## Step 5: Test the Connection

1. Open your application (locally or deployed)
2. Create a new trip
3. Check the browser console - you shouldn't see any Supabase-related errors
4. Open Supabase dashboard → Table Editor → "trips" table
5. You should see your newly created trip in the database!

## Fallback Behavior

If Supabase is not configured or unavailable, the app automatically falls back to using browser localStorage. This means:
- ✅ The app still works without Supabase
- ❌ Trips are only saved on the current device/browser
- ❌ Sharing links won't work across different devices

## Troubleshooting

### "Failed to fetch" errors
- Check that your Supabase project URL and anon key are correct
- Verify that your Supabase project is active (not paused)
- Check browser console for CORS errors

### Trips not saving to database
- Verify the SQL schema was executed successfully
- Check the browser console for any error messages
- Ensure Row Level Security policies are enabled

### Can't see other participants' availability
- Make sure you're using the same trip URL
- Verify that the participant saved their availability (clicked "Save")
- Check that the database has the participant's data in the "participants" table

## Security Notes

- The anon key is safe to expose in client-side code
- Row Level Security (RLS) policies control data access
- All trips are public by design (for easy sharing)
- Never commit your `.env` file to git (it's already in .gitignore)

## Support

For issues related to:
- **Supabase setup**: [Supabase Documentation](https://supabase.com/docs)
- **WeGoWhen app**: [GitHub Issues](https://github.com/janwan2003/trip-planner/issues)
