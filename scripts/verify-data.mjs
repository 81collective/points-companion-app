import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcjgtbcddpmfsppxyexq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjamd0YmNkZHBtZnNwcHh5ZXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTA5OTIsImV4cCI6MjA2OTU2Njk5Mn0.yKo9UyD0AbAaxOuksaknBLpSWa3HrHGR7U40bnYTerQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
  // Check credit_cards table
  console.log('\nChecking credit_cards table:');
  let { data: cards, error: cardsError } = await supabase
    .from('credit_cards')
    .select('*');

  if (cardsError) {
    console.error('Credit cards error:', cardsError.message);
  } else {
    console.log(`Found ${cards?.length || 0} cards`);
    if (cards && cards.length > 0) {
      console.log('Sample card:', cards[0]);
    }
  }

  // Check transactions table
  console.log('\nChecking transactions table:');
  let { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .limit(5);

  if (txError) {
    console.error('Transactions error:', txError.message);
  } else {
    console.log(`Found ${transactions?.length || 0} transactions`);
    if (transactions && transactions.length > 0) {
      console.log('Sample transaction:', transactions[0]);
    }
  }
}

verifyTables();
