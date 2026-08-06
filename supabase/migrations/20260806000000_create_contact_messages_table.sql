-- Migration to create contact_messages table for public user contact submissions

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT 'General Inquiry',
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'unread'
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public insert to contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow admin read contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow admin update contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow admin delete contact_messages" ON public.contact_messages;

-- Allow anyone (public or authenticated) to submit contact messages
CREATE POLICY "Allow public insert to contact_messages"
ON public.contact_messages FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated users to view contact messages in admin panel
CREATE POLICY "Allow admin read contact_messages"
ON public.contact_messages FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update status (mark read/archive)
CREATE POLICY "Allow admin update contact_messages"
ON public.contact_messages FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete contact messages
CREATE POLICY "Allow admin delete contact_messages"
ON public.contact_messages FOR DELETE
TO authenticated
USING (true);
