
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load env vars (Bun loads .env automatically)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function ingestResults() {
    console.log("Reading analysis results...");
    let results;
    try {
        const data = readFileSync('hadoop/analysis_results.json', 'utf-8');
        results = JSON.parse(data);
    } catch (e) {
        console.error("Failed to read results file:", e);
        return;
    }

    const threats: any[] = [];

    // value is any because of JSON parsing
    results.brute_force_ips.forEach((item: any) => {
        threats.push({
            source_ip: item.ip,
            threat_type: 'Brute Force Attempt',
            severity: 'critical',
            description: `Detected ${item.failed_attempts} failed login attempts in a short window.`,
            status: 'active',
            location: 'Unknown', // Could be enriched with GeoIP API
            timestamp: new Date().toISOString(),
        });
    });

    results.port_scan_ips.forEach((item: any) => {
        threats.push({
            source_ip: item.ip,
            threat_type: 'Port Scan',
            severity: 'high',
            description: `Detected sequential port access or mass 404s (${item.scan_attempts} attempts).`,
            status: 'active',
            location: 'Unknown',
            timestamp: new Date().toISOString(),
        });
    });

    if (threats.length === 0) {
        console.log("No threats detected to ingest.");
        return;
    }

    console.log(`Ingesting ${threats.length} threats into Supabase...`);

    const { error } = await supabase.from('threat_logs').insert(threats);

    if (error) {
        console.error("Error inserting threats:", error);
    } else {
        console.log("Successfully ingested threats.");
    }
}

ingestResults();
