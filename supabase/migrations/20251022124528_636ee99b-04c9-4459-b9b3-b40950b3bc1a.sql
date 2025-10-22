-- Create table for user notification settings
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications boolean NOT NULL DEFAULT true,
  lead_assignment_notifications boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notification settings
CREATE POLICY "Users can view their own notification settings"
ON public.user_notification_settings
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own notification settings
CREATE POLICY "Users can update their own notification settings"
ON public.user_notification_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Superadmins can view all notification settings
CREATE POLICY "Superadmins can view all notification settings"
ON public.user_notification_settings
FOR SELECT
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Policy: Superadmins can manage all notification settings
CREATE POLICY "Superadmins can manage all notification settings"
ON public.user_notification_settings
FOR ALL
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Policy: System can insert notification settings
CREATE POLICY "System can insert notification settings"
ON public.user_notification_settings
FOR INSERT
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_user_notification_settings_updated_at
BEFORE UPDATE ON public.user_notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();