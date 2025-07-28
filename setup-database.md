# 🚀 Database Setup Guide

## Your Supabase Project Details
- **Project URL**: https://ugqweqtlmgtgipbuslpj.supabase.co
- **Project ID**: ugqweqtlmgtgipbuslpj

## 📋 Step-by-Step Setup

### 1. Access Your Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: `ugqweqtlmgtgipbuslpj`

### 2. Run the Complete Database Setup
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy the entire content from `complete-database-setup.sql`
4. Paste it into the SQL editor
5. Click **"Run"** to execute

### 3. Verify the Setup
Run these verification queries in the SQL Editor:

```sql
-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected output:
```
affiliate_links
applications
certificates
donations
fundraising_progress
onboarding_tasks
profiles
```

```sql
-- Check if functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;
```

Expected output:
```
create_default_affiliate_link
generate_link_code
handle_new_user
update_fundraising_on_donation
update_updated_at_column
```

### 4. Test the Application
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Create a new user account:
   - Go to your app
   - Click "Sign Up"
   - Create a test account

3. Test the affiliate links:
   - After signing up, go to `/affiliate`
   - You should see your affiliate link management page
   - Copy the generated link

4. Test the donation page:
   - Visit the generated link (e.g., `/donate/ABC12345`)
   - You should see the donation form

## 🔧 Environment Configuration

Your Supabase client has been updated with the new credentials:

```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = "https://ugqweqtlmgtgipbuslpj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncXdlcXRsbWd0Z2lwYnVzbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMzk4ODAsImV4cCI6MjA2MzkxNTg4MH0.SQESd3W-k6p6l5_0HSObuZ24tWL3ryrJ-sHX-2VkZCU";
```

## 🎯 What's Included in the Setup

### Tables Created:
- ✅ `profiles` - User profiles
- ✅ `applications` - Internship applications  
- ✅ `onboarding_tasks` - User onboarding checklist
- ✅ `fundraising_progress` - Fundraising tracking
- ✅ `certificates` - Completion certificates
- ✅ `affiliate_links` - Payment sharing links
- ✅ `donations` - Donation transactions

### Features Enabled:
- ✅ **Automatic user setup** when users sign up
- ✅ **Affiliate link generation** for new users
- ✅ **Fundraising progress tracking**
- ✅ **Secure access control** with RLS policies
- ✅ **File storage** for resumes and certificates
- ✅ **Complete affiliate payment system**

## 🚀 Next Steps

1. **Run the SQL** in your Supabase SQL Editor
2. **Test the application** with a new user account
3. **Visit `/affiliate`** to manage payment links
4. **Share the generated link** to test donations

## 🔍 Troubleshooting

### If you get errors:
1. **Check RLS policies** - Make sure all policies are created
2. **Verify triggers** - Ensure user creation triggers are working
3. **Test authentication** - Confirm Supabase auth is configured

### Common Issues:
- **"Table doesn't exist"** - Run the complete SQL again
- **"Policy not found"** - Check if RLS policies were created
- **"Function not found"** - Verify all functions were created

## 📞 Support

If you encounter any issues:
1. Check the Supabase dashboard logs
2. Verify all SQL executed successfully
3. Test with a fresh user account

---

**Status**: ✅ Ready to deploy
**Last Updated**: January 2025 