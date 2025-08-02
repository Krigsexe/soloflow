import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vterkxdfyvhrnottcxhb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0ZXJreGRmeXZocm5vdHRjeGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI0NzEsImV4cCI6MjA2OTMwODQ3MX0.62-QCkfmE2sU_FaTr2yH9eis3u6708XKlaiS60kQf0g';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Export supabase as db for compatibility
export const db = supabase;

// Export types if they exist
export * from "./prisma/types";
export * from "./prisma/enums";
