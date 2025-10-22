-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'manager');

-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'in_progress', 'converted', 'closed');

-- Create enum for lead tags
CREATE TYPE public.lead_tag AS ENUM ('hot', 'spam', 'called', 'urgent');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'manager',
  can_manage_crud BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  support_type TEXT,
  visit_frequency TEXT,
  care_duration TEXT,
  priority TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  status public.lead_status NOT NULL DEFAULT 'new',
  assigned_manager_id UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create lead_tags table
CREATE TABLE public.lead_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tag public.lead_tag NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lead_id, tag)
);

-- Enable RLS on lead_tags
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;

-- Create lead_notes table
CREATE TABLE public.lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on lead_notes
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

-- Create onboarding_questions table for CMS
CREATE TABLE public.onboarding_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number INTEGER NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  field_name TEXT NOT NULL,
  options JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on onboarding_questions
ALTER TABLE public.onboarding_questions ENABLE ROW LEVEL SECURITY;

-- Insert default onboarding questions
INSERT INTO public.onboarding_questions (step_number, question_text, field_name, options) VALUES
(1, 'What type of support are you looking for?', 'support_type', '["Live-in care", "Visiting care", "Respite care", "Specialist care"]'),
(2, 'How often would you like visits?', 'visit_frequency', '["Once a week", "2-3 times a week", "Daily", "Multiple times daily"]'),
(3, 'How long do you need care for?', 'care_duration', '["Short-term (less than 3 months)", "Medium-term (3-6 months)", "Long-term (6+ months)", "Ongoing"]'),
(4, 'What''s your priority?', 'priority', '["Start ASAP", "Within a week", "Within a month", "Just exploring options"]');

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user can manage CRUD
CREATE OR REPLACE FUNCTION public.can_manage_crud(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = 'superadmin' OR (role = 'admin' AND can_manage_crud = TRUE))
  )
$$;

-- Create function to handle new user signup (create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_questions_updated_at
  BEFORE UPDATE ON public.onboarding_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Superadmins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view their own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Superadmins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

-- RLS Policies for leads
CREATE POLICY "Superadmins can view all leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins can view all leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view assigned leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'manager') AND 
    (assigned_manager_id = auth.uid() OR assigned_manager_id IS NULL)
  );

CREATE POLICY "Authenticated users can insert leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Superadmins can update all leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins can update all leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Superadmins can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (public.can_manage_crud(auth.uid()));

-- RLS Policies for lead_tags
CREATE POLICY "Users can view lead tags based on lead access"
  ON public.lead_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE id = lead_id
      AND (
        public.has_role(auth.uid(), 'superadmin') OR
        public.has_role(auth.uid(), 'admin') OR
        (public.has_role(auth.uid(), 'manager') AND assigned_manager_id = auth.uid())
      )
    )
  );

CREATE POLICY "Admins and superadmins can manage tags"
  ON public.lead_tags FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'superadmin') OR
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for lead_notes
CREATE POLICY "Users can view notes based on lead access"
  ON public.lead_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE id = lead_id
      AND (
        public.has_role(auth.uid(), 'superadmin') OR
        public.has_role(auth.uid(), 'admin') OR
        (public.has_role(auth.uid(), 'manager') AND assigned_manager_id = auth.uid())
      )
    )
  );

CREATE POLICY "Authenticated users can insert notes"
  ON public.lead_notes FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own notes"
  ON public.lead_notes FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Superadmins with CRUD can delete notes"
  ON public.lead_notes FOR DELETE
  TO authenticated
  USING (public.can_manage_crud(auth.uid()));

-- RLS Policies for onboarding_questions
CREATE POLICY "Everyone can view active questions"
  ON public.onboarding_questions FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Users with CRUD access can manage questions"
  ON public.onboarding_questions FOR ALL
  TO authenticated
  USING (public.can_manage_crud(auth.uid()));