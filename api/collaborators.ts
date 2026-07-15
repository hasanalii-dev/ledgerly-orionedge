// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plannerId } = req.query;
  const authHeader = req.headers.authorization;

  if (!plannerId || !authHeader) {
    return res.status(400).json({ error: 'Missing plannerId or auth header' });
  }

  // Initialize Supabase clients
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  try {
    // 1. Verify the requesting user has access to this planner
    const { data: plannerAccess } = await supabase
      .from('planners')
      .select('id')
      .eq('id', plannerId)
      .maybeSingle();

    const { data: collabAccess } = await supabase
      .from('planner_collaborators')
      .select('planner_id')
      .eq('planner_id', plannerId)
      .maybeSingle();

    if (!plannerAccess && !collabAccess) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 2. Fetch all collaborator user IDs
    const { data: planner } = await supabaseAdmin
      .from('planners')
      .select('user_id')
      .eq('id', plannerId)
      .single();

    const { data: collabs } = await supabaseAdmin
      .from('planner_collaborators')
      .select('user_id')
      .eq('planner_id', plannerId);

    const userIds = new Set([planner?.user_id, ...(collabs || []).map(c => c.user_id)].filter(Boolean));

    // 3. Fetch their profiles
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('id', Array.from(userIds));

    // 4. Map auth emails to profiles
    const result = [];
    for (const profile of profiles || []) {
      const { data: userAuth } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      result.push({
        ...profile,
        email: userAuth?.user?.email || null
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
