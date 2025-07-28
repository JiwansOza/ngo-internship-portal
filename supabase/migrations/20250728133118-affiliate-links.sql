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

-- Enable Row Level Security
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for affiliate_links
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

-- Create RLS policies for donations
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

-- Create function to generate unique link codes
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

-- Create function to automatically create affiliate link for new users
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

-- Create trigger to automatically create affiliate link on user signup
CREATE TRIGGER on_user_affiliate_link_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_affiliate_link();

-- Create function to update fundraising progress when donation is made
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

-- Create trigger to update fundraising progress on donation
CREATE TRIGGER on_donation_completed
  AFTER INSERT OR UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_fundraising_on_donation();

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_affiliate_links_updated_at BEFORE UPDATE ON public.affiliate_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 