-- 1. Enable Row Level Security on the card_nodes table
ALTER TABLE public."card_nodes" ENABLE ROW LEVEL SECURITY;

-- Grant all actions to the postgres role (or relevant admin role) to bypass RLS for admin tasks
-- Adjust 'postgres' if your superuser role has a different name
-- This is often needed for migrations or direct admin access. BE CAREFUL with this.
-- You might want to comment this out if not strictly needed or use a more specific role.
-- ALTER TABLE public."card_nodes" FORCE ROW LEVEL SECURITY; -- Use this instead if you want RLS for ALL roles including postgres
-- GRANT ALL ON TABLE public."card_nodes" TO postgres; -- Grant explicit bypass if needed and RLS is not forced for the role

-- 2. Create SELECT policy: Allow users to select card_nodess belonging to projects they own.
CREATE POLICY "Allow SELECT for project owner"
ON public."card_nodes"
FOR SELECT
USING (
  auth.uid() = (
    SELECT owner_id FROM public."projects" WHERE id = "card_nodes".project_id
  )
);

-- 3. Create INSERT policy: Allow users to insert card_nodess only into projects they own.
CREATE POLICY "Allow INSERT for project owner"
ON public."card_nodes"
FOR INSERT
WITH CHECK (
  auth.uid() = (
    SELECT owner_id FROM public."projects" WHERE id = "card_nodes".project_id
  )
);

-- 4. Create UPDATE policy: Allow users to update card_nodess belonging to projects they own.
--    (Also ensures they cannot change the.project_id to a project they don't own)
CREATE POLICY "Allow UPDATE for project owner"
ON public."card_nodes"
FOR UPDATE
USING (
  auth.uid() = (
    SELECT owner_id FROM public."projects" WHERE id = "card_nodes".project_id
  )
)
WITH CHECK (
  auth.uid() = (
    SELECT owner_id FROM public."projects" WHERE id = "card_nodes".project_id
  )
);

-- 5. Create DELETE policy: Allow users to delete card_nodess belonging to projects they own.
CREATE POLICY "Allow DELETE for project owner"
ON public."card_nodes"
FOR DELETE
USING (
  auth.uid() = (
    SELECT owner_id FROM public."projects" WHERE id = "card_nodes".project_id
  )
);

-- Confirmation message (optional, will appear in Supabase SQL Editor results)
SELECT 'RLS policies for card_nodes table created successfully.';