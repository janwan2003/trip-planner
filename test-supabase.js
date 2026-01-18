import { supabase, isSupabaseConfigured } from './src/lib/supabase.ts';

console.log('Testing Supabase connection...');
console.log('Configured:', isSupabaseConfigured());

if (isSupabaseConfigured()) {
  // Test connection by trying to fetch from trips table
  const { data, error } = await supabase!
    .from('trips')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Supabase Error:', error);
  } else {
    console.log('✅ Supabase Connected! Data:', data);
  }
} else {
  console.log('❌ Supabase not configured');
}
