-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  resume_url TEXT,
  motivation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create onboarding_tasks table
CREATE TABLE public.onboarding_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
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

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundraising_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for applications
CREATE POLICY "Users can view their own application" ON public.applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own application" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own application" ON public.applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for onboarding_tasks
CREATE POLICY "Users can view their own tasks" ON public.onboarding_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.onboarding_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON public.onboarding_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for fundraising_progress
CREATE POLICY "Users can view their own fundraising progress" ON public.fundraising_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own fundraising progress" ON public.fundraising_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fundraising progress" ON public.fundraising_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "All users can view fundraising leaderboard" ON public.fundraising_progress
  FOR SELECT USING (true);

-- Create RLS policies for certificates
CREATE POLICY "Users can view their own certificate" ON public.certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own certificate" ON public.certificates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certificate" ON public.certificates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for resumes and certificates
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false);

-- Create storage policies for resumes
CREATE POLICY "Users can upload their own resume" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own resume" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own resume" ON storage.objects
  FOR UPDATE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for certificates
CREATE POLICY "Users can view their own certificate" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to automatically create profile on user signup
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

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_onboarding_tasks_updated_at BEFORE UPDATE ON public.onboarding_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fundraising_progress_updated_at BEFORE UPDATE ON public.fundraising_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();