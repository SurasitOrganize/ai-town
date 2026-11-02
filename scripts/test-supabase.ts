import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('Testing Supabase connection...\n');

  // Test 1: Anonymous sign-in
  console.log('1. Testing anonymous sign-in...');
  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
  if (authError) {
    console.error('  ✗ Auth error:', authError.message);
    return;
  }
  console.log('  ✓ Successfully signed in anonymously');

  // Test 2: Read seeded agents
  console.log('\n2. Testing reading seeded agents...');
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: true });

  if (agentsError) {
    console.error('  ✗ Error reading agents:', agentsError.message);
    return;
  }

  console.log(`  ✓ Successfully read ${agents.length} agents:`);
  agents.forEach((agent: any) => {
    console.log(`    - ${agent.name} (${agent.role}) - ${agent.status}`);
  });

  // Test 3: Insert a test agent
  console.log('\n3. Testing insert agent...');
  const testAgent = {
    name: 'Test Agent',
    role: 'QA Tester',
    instructions: 'Test instructions',
    allowed_tools: ['web_search'],
    status: 'online' as const,
    desk_x: 300,
    desk_y: 250,
    avatar: '🧪',
    is_lead: false,
  };

  const { data: newAgent, error: insertError } = await supabase
    .from('agents')
    .insert([testAgent])
    .select()
    .single();

  if (insertError) {
    console.error('  ✗ Error inserting agent:', insertError.message);
    return;
  }

  console.log('  ✓ Successfully inserted test agent:');
  console.log(`    ID: ${newAgent.id}`);
  console.log(`    Name: ${newAgent.name}`);

  // Test 4: Delete the test agent
  console.log('\n4. Testing delete agent...');
  const { error: deleteError } = await supabase
    .from('agents')
    .delete()
    .eq('id', newAgent.id);

  if (deleteError) {
    console.error('  ✗ Error deleting agent:', deleteError.message);
    return;
  }

  console.log('  ✓ Successfully deleted test agent');

  // Test 5: Read tasks
  console.log('\n5. Testing reading tasks...');
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .limit(5);

  if (tasksError) {
    console.error('  ✗ Error reading tasks:', tasksError.message);
    return;
  }

  console.log(`  ✓ Successfully read ${tasks.length} tasks`);

  console.log('\n✓ All tests passed!');
}

testSupabase().catch(console.error);
