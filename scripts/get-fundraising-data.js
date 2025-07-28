// Script to get fundraising data from Supabase
// Usage: node scripts/get-fundraising-data.js

const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getAllFundraisingData() {
  try {
    console.log('📊 Fetching all fundraising data...\n');
    
    const { data, error } = await supabase
      .from('fundraising_progress')
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .order('collected_amount', { ascending: false });

    if (error) throw error;

    console.log(`✅ Found ${data.length} fundraisers\n`);
    
    // Calculate statistics
    const totalRaised = data.reduce((sum, item) => sum + item.collected_amount, 0);
    const totalTarget = data.reduce((sum, item) => sum + item.target_amount, 0);
    const averageRaised = totalRaised / data.length;
    const completionRate = (totalRaised / totalTarget) * 100;

    console.log('📈 FUNDRAISING STATISTICS:');
    console.log(`   Total Raised: ₹${totalRaised.toLocaleString()}`);
    console.log(`   Total Fundraisers: ${data.length}`);
    console.log(`   Average Raised: ₹${Math.round(averageRaised).toLocaleString()}`);
    console.log(`   Completion Rate: ${completionRate.toFixed(1)}%\n`);

    console.log('🏆 TOP 10 FUNDRAISERS:');
    data.slice(0, 10).forEach((item, index) => {
      const progress = (item.collected_amount / item.target_amount) * 100;
      console.log(`   ${index + 1}. ${item.profiles?.full_name || 'Anonymous'}`);
      console.log(`      Collected: ₹${item.collected_amount.toLocaleString()}`);
      console.log(`      Target: ₹${item.target_amount.toLocaleString()}`);
      console.log(`      Progress: ${progress.toFixed(1)}%\n`);
    });

    return data;
  } catch (error) {
    console.error('❌ Error fetching fundraising data:', error);
    return [];
  }
}

async function exportToCSV(data) {
  const headers = [
    'User ID',
    'Full Name',
    'Email',
    'Target Amount',
    'Collected Amount',
    'Progress %',
    'Created At',
    'Updated At'
  ];

  const csvRows = [
    headers.join(','),
    ...data.map(item => [
      item.user_id,
      `"${item.profiles?.full_name || 'N/A'}"`,
      `"${item.profiles?.email || 'N/A'}"`,
      item.target_amount,
      item.collected_amount,
      ((item.collected_amount / item.target_amount) * 100).toFixed(2),
      item.created_at,
      item.updated_at
    ].join(','))
  ];

  const csvContent = csvRows.join('\n');
  const fs = require('fs');
  const filename = `fundraising-data-${new Date().toISOString().split('T')[0]}.csv`;
  
  fs.writeFileSync(filename, csvContent);
  console.log(`📄 Data exported to ${filename}`);
}

async function main() {
  console.log('🚀 Starting fundraising data export...\n');
  
  const data = await getAllFundraisingData();
  
  if (data.length > 0) {
    await exportToCSV(data);
    console.log('\n✅ Export completed successfully!');
  } else {
    console.log('\n❌ No data found or error occurred');
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  getAllFundraisingData,
  exportToCSV
}; 