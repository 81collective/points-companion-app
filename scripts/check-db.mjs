import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcjgtbcddpmfsppxyexq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjamd0YmNkZHBtZnNwcHh5ZXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTA5OTIsImV4cCI6MjA2OTU2Njk5Mn0.yKo9UyD0AbAaxOuksaknBLpSWa3HrHGR7U40bnYTerQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  // Check credit_cards table
  const { data: cardsData, error: cardsError } = await supabase
    .from('credit_cards')
    .select('*')
    .limit(1);

  console.log('\nChecking credit_cards table:');
  if (cardsError) {
    console.error('Error:', cardsError.message);
  } else {
    console.log('Table exists');
    console.log('Sample data:', cardsData);
  }

  // Check transactions table
  const { data: txData, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .limit(1);

  console.log('\nChecking transactions table:');
  if (txError) {
    console.error('Error:', txError.message);
  } else {
    console.log('Table exists');
    console.log('Sample data:', txData);
  }
}

checkDatabase();
