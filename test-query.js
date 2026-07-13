const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Signing in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'info@orionedgedigital.pk',
    password: 'password123' // assuming this is a test password, or we can just try to fetch anonymously
  });
  
  if (authError) {
    console.log("Could not sign in:", authError.message);
  } else {
    console.log("Signed in as:", authData.user.id);
  }

  console.log("Fetching planners...");
  const { data: planners, error: err1 } = await supabase
    .from("planners")
    .select("id, is_default, created_at")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1);
    
  console.log("Loader query:", planners, err1);

  if (planners && planners.length > 0) {
    const id = planners[0].id;
    console.log("Fetching single planner:", id);
    const { data: planner, error: err2 } = await supabase
      .from("planners")
      .select("*")
      .eq("id", id)
      .maybeSingle();
      
    console.log("Planner query:", planner, err2);
  }
}

run();
