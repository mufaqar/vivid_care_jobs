-- Drop the existing policy that allows all admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a new policy that only allows superadmins and admins with CRUD privileges to view all profiles
CREATE POLICY "Superadmins and admins with CRUD can view all profiles" 
  ON public.profiles 
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'superadmin'::app_role) 
    OR public.can_manage_crud(auth.uid())
  );