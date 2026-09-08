import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log("Connecting to", url);

const supabase = createClient(url, key);

const channel = supabase.channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'Task',
    },
    (payload) => {
      console.log('Realtime payload received:', payload);
    }
  )
  .subscribe((status, err) => {
    console.log('Status:', status);
    if (err) console.error(err);
  });

console.log("Listening for changes on Task table...");
