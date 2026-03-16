// Check the actual table schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dxxtxdyrovawugvvrhah.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4eHR4ZHlyb3Zhd3VndnZyaGFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTYxMjEyOSwiZXhwIjoyMDQ1MTg4MTI5fQ.A-7kre5-qEw3jlSW4C8UVDgbJTAnpbx2VINYraDmrJ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking kds_orders table schema...');
  
  try {
    const { data, error } = await supabase
      .from('kds_orders')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Schema check successful');
      if (data && data.length > 0) {
        console.log('📋 Available columns:', Object.keys(data[0]));
      } else {
        console.log('📋 Table exists but is empty');
      }
    }
  } catch (err) {
    console.error('❌ Schema check failed:', err);
  }
}

checkSchema();