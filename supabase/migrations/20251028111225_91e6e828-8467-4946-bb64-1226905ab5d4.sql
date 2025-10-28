-- Update the policy to allow anonymous users to read the 2FA setting
DROP POLICY IF EXISTS "Anyone can read settings" ON public.system_settings;

CREATE POLICY "Anyone can read settings"
  ON public.system_settings
  FOR SELECT
  USING (true);