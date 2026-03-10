import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rlgmvrwkwvhdwshbxvjy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZ212cndrd3ZoZHdzaGJ4dmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzM3NTYsImV4cCI6MjA4ODUwOTc1Nn0.y6PCzQKGCrb8Ip1IzKwl648EklwowA8nAap9Dy0jFT0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
