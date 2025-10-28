-- Create system_settings table for app-wide configurations
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value boolean NOT NULL DEFAULT false,
  description text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only superadmins can manage settings
CREATE POLICY "Superadmins can manage all settings"
  ON public.system_settings
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'::app_role));

-- Everyone can read settings (needed for auth flow)
CREATE POLICY "Anyone can read settings"
  ON public.system_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default 2FA setting (disabled by default)
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES ('require_2fa', false, 'Require two-factor authentication for all users');

-- Add trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();