import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcjgtbcddpmfsppxyexq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjamd0YmNkZHBtZnNwcHh5ZXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTA5OTIsImV4cCI6MjA2OTU2Njk5Mn0.yKo9UyD0AbAaxOuksaknBLpSWa3HrHGR7U40bnYTerQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingStructure() {
  // Query to get table information
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*')
    .limit(1);

  console.log('Credit Cards Table Structure:');
  if (error) {
    console.error('Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    console.log('No data found');
  }
}

checkExistingStructure();
