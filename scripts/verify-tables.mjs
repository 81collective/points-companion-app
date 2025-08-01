import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcjgtbcddpmfsppxyexq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjamd0YmNkZHBtZnNwcHh5ZXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTA5OTIsImV4cCI6MjA2OTU2Njk5Mn0.yKo9UyD0AbAaxOuksaknBLpSWa3HrHGR7U40bnYTerQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to verify table structure
async function describeTable(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select()
    .limit(3);

  console.log(`\nTable: ${tableName}`);
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Sample rows:', data);
    if (data && data[0]) {
      console.log('\nColumns:');
      Object.keys(data[0]).forEach(column => {
        console.log(`- ${column}: ${typeof data[0][column]}`);
      });
    }
  }
}

// Check both tables
async function verifyTables() {
  await describeTable('credit_cards');
  await describeTable('transactions');
}

verifyTables();
