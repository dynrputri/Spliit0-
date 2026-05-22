import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project-id.supabase.co');

// Initialize the client if config exists, otherwise return null
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Help check connection to live Supabase project
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase URL or Anon Key is missing. Check .env or system coordinates.'
    };
  }

  try {
    // Just run a simple health query to test configuration keys
    const { data, error } = await supabase.from('groups').select('id').limit(1);
    
    if (error) {
      // If table doesn't exist, configuration is still correct but schema is missing
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connection configuration is correct! SQL schema is required to build tables.'
        };
      }
      return { 
        success: false, 
        message: error.message 
      };
    }
    
    return {
      success: true,
      message: 'Successfully connected and tables are accessible!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to ping Supabase cloud endpoint.'
    };
  }
}
