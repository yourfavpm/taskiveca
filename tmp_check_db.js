const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
    }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    try {
        console.log('--- Case Studies ---');
        const { data: cs, error: cse } = await supabase.from('case_studies').select('slug, title, published');
        if (cse) console.error('CS Error:', cse);
        else console.log(JSON.stringify(cs, null, 2));

        console.log('\n--- Testimonials ---');
        const { data: ts, error: tse } = await supabase.from('testimonials').select('name, active');
        if (tse) console.error('TS Error:', tse);
        else console.log(JSON.stringify(ts, null, 2));
    } catch (e) {
        console.error('Fatal error:', e);
    }
}

run();
