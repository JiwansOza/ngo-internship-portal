-- =====================================================
-- ADD MISSING COMPONENTS TO EXISTING DATABASE
-- This script only adds what's missing, doesn't recreate existing tables
-- =====================================================

-- =====================================================
-- 1. ADD ROLE COLUMN TO PROFILES TABLE (if missing)
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        RAISE NOTICE 'Added role column to profiles table';
    ELSE
        RAISE NOTICE 'Role column already exists in profiles table';
    END IF;
END $$;

-- =====================================================
-- 2. CREATE MISSING TABLES (if they don't exist)
-- =====================================================

-- Create affiliate_links table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.affiliate_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  link_code VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL DEFAULT 'Support My Fundraising',
  description TEXT,
  target_amount DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_link_id UUID NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  donor_name VARCHAR(255),
  donor_email VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. ENABLE RLS FOR NEW TABLES
-- =====================================================

ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Affiliate links policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own affiliate links') THEN
        CREATE POLICY "Users can view their own affiliate links" ON public.affiliate_links
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create their own affiliate links') THEN
        CREATE POLICY "Users can create their own affiliate links" ON public.affiliate_links
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own affiliate links') THEN
        CREATE POLICY "Users can update their own affiliate links" ON public.affiliate_links
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own affiliate links') THEN
        CREATE POLICY "Users can delete their own affiliate links" ON public.affiliate_links
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view active affiliate links') THEN
        CREATE POLICY "Public can view active affiliate links" ON public.affiliate_links
          FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- Donations policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view donations for their affiliate links') THEN
        CREATE POLICY "Users can view donations for their affiliate links" ON public.donations
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.affiliate_links 
              WHERE affiliate_links.id = donations.affiliate_link_id 
              AND affiliate_links.user_id = auth.uid()
            )
          );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create donations') THEN
        CREATE POLICY "Anyone can create donations" ON public.donations
          FOR INSERT WITH CHECK (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update donations for their affiliate links') THEN
        CREATE POLICY "Users can update donations for their affiliate links" ON public.donations
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM public.affiliate_links 
              WHERE affiliate_links.id = donations.affiliate_link_id 
              AND affiliate_links.user_id = auth.uid()
            )
          );
    END IF;
END $$;

-- =====================================================
-- 5. CREATE ADMIN RLS POLICIES
-- =====================================================

-- Allow admins to view all fundraising data
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all fundraising progress') THEN
        CREATE POLICY "Admins can view all fundraising progress" ON public.fundraising_progress
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE profiles.user_id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
    END IF;
END $$;

-- Allow admins to view all affiliate links
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all affiliate links') THEN
        CREATE POLICY "Admins can view all affiliate links" ON public.affiliate_links
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE profiles.user_id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
    END IF;
END $$;

-- Allow admins to view all donations
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all donations') THEN
        CREATE POLICY "Admins can view all donations" ON public.donations
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE profiles.user_id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
    END IF;
END $$;

-- Allow admins to view all applications
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all applications') THEN
        CREATE POLICY "Admins can view all applications" ON public.applications
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE profiles.user_id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
    END IF;
END $$;

-- Allow admins to view all profiles
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all profiles') THEN
        CREATE POLICY "Admins can view all profiles" ON public.profiles
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.profiles p2
              WHERE p2.user_id = auth.uid() 
              AND p2.role = 'admin'
            )
          );
    END IF;
END $$;

-- =====================================================
-- 6. CREATE STORAGE BUCKETS (if they don't exist)
-- =====================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'resumes') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'certificates') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false);
    END IF;
END $$;

-- =====================================================
-- 7. CREATE STORAGE POLICIES (if they don't exist)
-- =====================================================

-- Resume storage policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own resume') THEN
        CREATE POLICY "Users can upload their own resume" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own resume') THEN
        CREATE POLICY "Users can view their own resume" ON storage.objects
          FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own resume') THEN
        CREATE POLICY "Users can update their own resume" ON storage.objects
          FOR UPDATE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

-- Certificate storage policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own certificate') THEN
        CREATE POLICY "Users can view their own certificate" ON storage.objects
          FOR SELECT USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

-- =====================================================
-- 8. CREATE FUNCTIONS (if they don't exist)
-- =====================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique link codes
CREATE OR REPLACE FUNCTION public.generate_link_code()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
  code VARCHAR(20);
  exists_already BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.affiliate_links WHERE link_code = code) INTO exists_already;
    
    -- If code doesn't exist, return it
    IF NOT exists_already THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Function to automatically create profile and related data on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  
  -- Create default fundraising progress
  INSERT INTO public.fundraising_progress (user_id, target_amount, collected_amount)
  VALUES (NEW.id, 5000.00, 0.00);
  
  -- Create default onboarding tasks
  INSERT INTO public.onboarding_tasks (user_id, task_name, description, order_index) VALUES
    (NEW.id, 'Complete Application', 'Submit your internship application', 1),
    (NEW.id, 'Profile Setup', 'Complete your profile information', 2),
    (NEW.id, 'Orientation', 'Attend the orientation session', 3),
    (NEW.id, 'Start Fundraising', 'Begin your fundraising campaign', 4),
    (NEW.id, 'First Milestone', 'Reach 25% of your fundraising goal', 5);
    
  -- Create certificate entry
  INSERT INTO public.certificates (user_id, is_eligible)
  VALUES (NEW.id, false);
  
  RETURN NEW;
END;
$$;

-- Function to automatically create affiliate link for new users
CREATE OR REPLACE FUNCTION public.create_default_affiliate_link()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.affiliate_links (user_id, link_code, title, description)
  VALUES (
    NEW.id,
    public.generate_link_code(),
    'Support My Fundraising Campaign',
    'Help me reach my fundraising goal for the NGO internship program!'
  );
  
  RETURN NEW;
END;
$$;

-- Function to update fundraising progress when donation is made
CREATE OR REPLACE FUNCTION public.update_fundraising_on_donation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Update fundraising progress when donation is completed
  IF NEW.payment_status = 'completed' THEN
    UPDATE public.fundraising_progress 
    SET collected_amount = collected_amount + NEW.amount
    WHERE user_id = (
      SELECT user_id FROM public.affiliate_links 
      WHERE id = NEW.affiliate_link_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role VARCHAR(20);
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE user_id = $1;
  
  RETURN user_role = 'admin';
END;
$$;

-- Function to get all fundraising data for admins
CREATE OR REPLACE FUNCTION public.get_all_fundraising_data()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  target_amount DECIMAL(10,2),
  collected_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  RETURN QUERY
  SELECT 
    fp.id,
    fp.user_id,
    fp.target_amount,
    fp.collected_amount,
    fp.created_at,
    fp.updated_at,
    p.full_name,
    p.email
  FROM public.fundraising_progress fp
  LEFT JOIN public.profiles p ON fp.user_id = p.user_id
  ORDER BY fp.collected_amount DESC;
END;
$$;

-- =====================================================
-- 9. CREATE TRIGGERS (if they don't exist)
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_affiliate_link_created ON auth.users;
DROP TRIGGER IF EXISTS on_donation_completed ON public.donations;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_user_affiliate_link_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_affiliate_link();

CREATE TRIGGER on_donation_completed
  AFTER INSERT OR UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_fundraising_on_donation();

-- Create timestamp triggers (drop and recreate to avoid conflicts)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
DROP TRIGGER IF EXISTS update_onboarding_tasks_updated_at ON public.onboarding_tasks;
DROP TRIGGER IF EXISTS update_fundraising_progress_updated_at ON public.fundraising_progress;
DROP TRIGGER IF EXISTS update_certificates_updated_at ON public.certificates;
DROP TRIGGER IF EXISTS update_affiliate_links_updated_at ON public.affiliate_links;
DROP TRIGGER IF EXISTS update_donations_updated_at ON public.donations;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_onboarding_tasks_updated_at BEFORE UPDATE ON public.onboarding_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fundraising_progress_updated_at BEFORE UPDATE ON public.fundraising_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_affiliate_links_updated_at BEFORE UPDATE ON public.affiliate_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 10. CREATE INDEXES (if they don't exist)
-- =====================================================

-- Create indexes if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_user_id') THEN
        CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_email') THEN
        CREATE INDEX idx_profiles_email ON public.profiles(email);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_applications_user_id') THEN
        CREATE INDEX idx_applications_user_id ON public.applications(user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_onboarding_tasks_user_id') THEN
        CREATE INDEX idx_onboarding_tasks_user_id ON public.onboarding_tasks(user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fundraising_progress_user_id') THEN
        CREATE INDEX idx_fundraising_progress_user_id ON public.fundraising_progress(user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_certificates_user_id') THEN
        CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_affiliate_links_user_id') THEN
        CREATE INDEX idx_affiliate_links_user_id ON public.affiliate_links(user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_affiliate_links_link_code') THEN
        CREATE INDEX idx_affiliate_links_link_code ON public.affiliate_links(link_code);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_donations_affiliate_link_id') THEN
        CREATE INDEX idx_donations_affiliate_link_id ON public.donations(affiliate_link_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_donations_payment_status') THEN
        CREATE INDEX idx_donations_payment_status ON public.donations(payment_status);
    END IF;
END $$;

-- =====================================================
-- 11. CREATE AFFILIATE LINKS FOR EXISTING USERS
-- =====================================================

-- Create affiliate links for existing users who don't have one
INSERT INTO public.affiliate_links (user_id, link_code, title, description)
SELECT 
  u.id,
  public.generate_link_code(),
  'Support My Fundraising Campaign',
  'Help me reach my fundraising goal for the NGO internship program!'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.affiliate_links al WHERE al.user_id = u.id
);

-- =====================================================
-- 12. VERIFICATION QUERIES
-- =====================================================

-- Check if role column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'role';

-- Check if affiliate_links table was created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'affiliate_links';

-- Check if donations table was created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'donations';

-- Check if admin functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'get_all_fundraising_data')
ORDER BY routine_name;

-- Check if triggers were created
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('on_auth_user_created', 'on_user_affiliate_link_created', 'on_donation_completed')
ORDER BY trigger_name;

-- =====================================================
-- MISSING COMPONENTS ADDED SUCCESSFULLY!
-- =====================================================

-- Your database now has:
-- ✅ Role column in profiles table
-- ✅ Affiliate links and donations tables
-- ✅ Admin RLS policies
-- ✅ Storage buckets and policies
-- ✅ All functions and triggers
-- ✅ Indexes for performance
-- ✅ Affiliate links for existing users

-- To make a user admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com'; 