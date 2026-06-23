import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nlxulpninwzwlxnzidup.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seHVscG5pbnd6d2x4bnppZHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNDcwNTcsImV4cCI6MjA5NzgyMzA1N30.aB2dJgz-cZJNWFwUOBsMBOU_ePxUiqjKS1QQD23gsQI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
