-- Dynamic Workspace Personalization Schema Update

-- 1. Ensure user_onboarding has all fields for storing complete onboarding responses
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS workspace_type text;
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS company_size text;
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS default_currency text DEFAULT 'USD';
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS current_workflow text;
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS primary_goals text[] DEFAULT '{}';

-- Allow user to update their own onboarding record if re-running
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'users can update own onboarding' AND tablename = 'user_onboarding'
  ) THEN
    CREATE POLICY "users can update own onboarding" ON public.user_onboarding FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'users can select own onboarding' AND tablename = 'user_onboarding'
  ) THEN
    CREATE POLICY "users can select own onboarding" ON public.user_onboarding FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

-- 2. Enhance planners table with workspace personalization settings
ALTER TABLE public.planners ADD COLUMN IF NOT EXISTS workspace_type text DEFAULT 'personal';
ALTER TABLE public.planners ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE public.planners ADD COLUMN IF NOT EXISTS custom_config jsonb DEFAULT '{}'::jsonb;
