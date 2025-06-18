import { createClient } from '@supabase/supabase-js';

// Manually set environment variables (since dotenv isn't working)
const supabaseUrl = 'https://totfmiywcmwjjblhrjdw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvdGZtaXl3Y213ampibGhyamR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMzc4MTUsImV4cCI6MjA1NTYxMzgxNX0.tMcb8mf5Lv00YonHnrEUeLkmY5kJtHYeaYkCanTe8f8';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugChat() {
  console.log('🔍 Debugging Chat Setup...\n');

  try {
    // Test 1: Check if chat tables exist
    console.log('1. Checking chat tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%chat%');
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
    } else {
      console.log('✅ Chat tables found:', tables.map(t => t.table_name));
    }

    // Test 2: Check if RPC functions exist
    console.log('\n2. Testing RPC functions...');
    try {
      const { data: rpcTest, error: rpcError } = await supabase.rpc('get_user_chat_rooms');
      if (rpcError) {
        console.log('❌ RPC Error:', rpcError.message);
      } else {
        console.log('✅ get_user_chat_rooms function works');
      }
    } catch (err) {
      console.log('❌ RPC function test failed:', err.message);
    }

    // Test 3: Check real-time publication
    console.log('\n3. Checking real-time setup...');
    const { data: realtimeData, error: realtimeError } = await supabase
      .from('pg_publication_tables')
      .select('*')
      .eq('pubname', 'supabase_realtime');
    
    if (realtimeError) {
      console.error('❌ Error checking real-time:', realtimeError);
    } else {
      const chatTables = realtimeData.filter(t => t.tablename.includes('chat'));
      console.log('✅ Chat tables in real-time publication:', chatTables.map(t => t.tablename));
    }

    // Test 4: Test basic operations
    console.log('\n4. Testing basic operations...');
    
    // Try to authenticate with a sample user (this will likely fail, but shows auth status)
    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('⚠️  Not authenticated (expected in script):', authError.message);
    } else {
      console.log('✅ User authenticated:', user.user?.email);
    }

    // Test table access
    const { data: roomsData, error: roomsError } = await supabase
      .from('chat_rooms')
      .select('*')
      .limit(1);
    
    if (roomsError) {
      console.log('❌ Chat rooms access error:', roomsError.message);
    } else {
      console.log('✅ Chat rooms table accessible');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugChat();
