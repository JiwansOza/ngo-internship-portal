-- Complete Database Setup for NGO Internship Portal
-- This SQL creates all tables, functions, triggers, and policies from scratch

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  resume_url TEXT,
  motivation_statement TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create onboarding_tasks table
CREATE TABLE public.onboarding_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fundraising_progress table
CREATE TABLE public.fundraising_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_amount DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
  collected_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_url TEXT,
  is_eligible BOOLEAN NOT NULL DEFAULT false,
  issued_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate_links table for payment sharing
CREATE TABLE public.affiliate_links (
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

-- Create donations table to track payments
CREATE TABLE public.donations (
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
-- 2. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundraising_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CREATE RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Applications policies
CREATE POLICY "Users can view their own application" ON public.applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own application" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own application" ON public.applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Onboarding tasks policies
CREATE POLICY "Users can view their own tasks" ON public.onboarding_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.onboarding_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON public.onboarding_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fundraising progress policies
CREATE POLICY "Users can view their own fundraising progress" ON public.fundraising_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own fundraising progress" ON public.fundraising_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fundraising progress" ON public.fundraising_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "All users can view fundraising leaderboard" ON public.fundraising_progress
  FOR SELECT USING (true);

-- Certificates policies
CREATE POLICY "Users can view their own certificate" ON public.certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own certificate" ON public.certificates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certificate" ON public.certificates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Affiliate links policies
CREATE POLICY "Users can view their own affiliate links" ON public.affiliate_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own affiliate links" ON public.affiliate_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate links" ON public.affiliate_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own affiliate links" ON public.affiliate_links
  FOR DELETE USING (auth.uid() = user_id);

-- Public access to view affiliate links (for payment pages)
CREATE POLICY "Public can view active affiliate links" ON public.affiliate_links
  FOR SELECT USING (is_active = true);

-- Donations policies
CREATE POLICY "Users can view donations for their affiliate links" ON public.donations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.affiliate_links 
      WHERE affiliate_links.id = donations.affiliate_link_id 
      AND affiliate_links.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create donations" ON public.donations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update donations for their affiliate links" ON public.donations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.affiliate_links 
      WHERE affiliate_links.id = donations.affiliate_link_id 
      AND affiliate_links.user_id = auth.uid()
    )
  );

-- =====================================================
-- 4. CREATE STORAGE BUCKETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false);

-- =====================================================
-- 5. CREATE STORAGE POLICIES
-- =====================================================

-- Resume storage policies
CREATE POLICY "Users can upload their own resume" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own resume" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own resume" ON storage.objects
  FOR UPDATE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Certificate storage policies
CREATE POLICY "Users can view their own certificate" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- 6. CREATE FUNCTIONS
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

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Create profile
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

-- =====================================================
-- 7. CREATE TRIGGERS
-- =====================================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to automatically create affiliate link on user signup
CREATE TRIGGER on_user_affiliate_link_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_affiliate_link();

-- Trigger to update fundraising progress on donation
CREATE TRIGGER on_donation_completed
  AFTER INSERT OR UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_fundraising_on_donation();

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_onboarding_tasks_updated_at BEFORE UPDATE ON public.onboarding_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fundraising_progress_updated_at BEFORE UPDATE ON public.fundraising_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_affiliate_links_updated_at BEFORE UPDATE ON public.affiliate_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 8. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Indexes for faster queries
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_onboarding_tasks_user_id ON public.onboarding_tasks(user_id);
CREATE INDEX idx_fundraising_progress_user_id ON public.fundraising_progress(user_id);
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_affiliate_links_user_id ON public.affiliate_links(user_id);
CREATE INDEX idx_affiliate_links_link_code ON public.affiliate_links(link_code);
CREATE INDEX idx_donations_affiliate_link_id ON public.donations(affiliate_link_id);
CREATE INDEX idx_donations_payment_status ON public.donations(payment_status);

-- =====================================================
-- 9. VERIFICATION QUERIES (Optional)
-- =====================================================

-- Uncomment these queries to verify the setup:

/*
-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if all functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;

-- Check if all triggers were created
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
ORDER BY trigger_name;

-- Check if all policies were created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
*/

-- =====================================================
-- 10. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment to add sample data for testing:

/*
-- Sample affiliate links for testing (if you have existing users)
-- Replace 'user-uuid-here' with actual user IDs from your auth.users table
INSERT INTO public.affiliate_links (user_id, link_code, title, description) VALUES
('user-uuid-here', 'TEST1234', 'Support My NGO Internship', 'Help me reach my fundraising goal!'),
('user-uuid-here', 'DEMO5678', 'Fund My Cause', 'Every donation makes a difference!');
*/

-- =====================================================
-- COMPLETE SETUP FINISHED
-- =====================================================

-- Your database is now ready with:
-- ✅ All tables created
-- ✅ Row Level Security enabled
-- ✅ All policies configured
-- ✅ Storage buckets set up
-- ✅ Functions and triggers created
-- ✅ Indexes for performance
-- ✅ Automatic affiliate link creation for new users
-- ✅ Automatic fundraising progress updates
-- ✅ Complete affiliate payment system

-- Next steps:
-- 1. Test the application
-- 2. Create a test user account
-- 3. Visit /affiliate to manage payment links
-- 4. Share the generated link to test donations 