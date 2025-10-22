-- Allow anonymous users to submit leads through the public form
CREATE POLICY "Anyone can submit leads"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (TRUE);