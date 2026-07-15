import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRpc() {
  const { data, error } = await supabase.rpc('get_planner_collaborators', { p_id: '123e4567-e89b-12d3-a456-426614174000' });
  console.log('Error:', error);
  console.log('Data:', data);
}

testRpc();
