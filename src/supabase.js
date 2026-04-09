import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://foshwqekcbuubtgtrtmb.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvc2h3cWVrY2J1dWJ0Z3RydG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDIzNjUsImV4cCI6MjA5MDgxODM2NX0.901Y1jE2JMpCWoEwfell3eKkZfhzxyIaddUwDxtkig8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
