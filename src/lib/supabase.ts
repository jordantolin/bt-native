import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlhwbajmoihosawvzikg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaHdiYWptb2lob3Nhd3Z6aWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTczODksImV4cCI6MjA2NDUzMzM4OX0.b42ssHWycbvzrtVDwJTqyDVPsxRcuWCKgCfuv4xqdIU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
