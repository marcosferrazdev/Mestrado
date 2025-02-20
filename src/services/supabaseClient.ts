import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eyhfqcveyfycxcubnxfl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5aGZxY3ZleWZ5Y3hjdWJueGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMTIyMzUsImV4cCI6MjA1NTU4ODIzNX0.3YGec7K4xREz8afA8VEnYD7qNkHAKRsXjaE9AL58uIk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
