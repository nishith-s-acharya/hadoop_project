
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load environment variables (handling standard .env file parsing manually if needed, or relying on Bun/Process)
// For Bun, process.env is populated if .env exists. 

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Error: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY not found in environment.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function formatApacheDate(isoString: string): string {
    const date = new Date(isoString);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    return `${day}/${month}/${year}:${hours}:${minutes}:${seconds} +0000`;
}

async function fetchAndExportLogs() {
    console.log("Fetching logs from Supabase...");

    const { data: logs, error } = await supabase
        .from("threat_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(10000); // Fetch last 10k logs for analysis

    if (error) {
        console.error("Failed to fetch logs:", error);
        process.exit(1);
    }

    if (!logs || logs.length === 0) {
        console.log("No logs found in Supabase.");
        return;
    }

    console.log(`Fetched ${logs.length} logs. Converting to Apache format...`);

    const apacheLogs = logs.map(log => {
        // Logic to recreate log lines based on threat type to match Mapper expectations

        let request = `GET / HTTP/1.1`;
        let status = 200;
        let size = 1234;

        const type = (log.threat_type || "").toLowerCase();

        if (type.includes("brute") || type.includes("login")) {
            request = `POST /login HTTP/1.1`;
            status = 401; // Failed login
        } else if (type.includes("scan") || type.includes("port")) {
            // Format: CONNECT <dest_ip>:443 ...
            request = `CONNECT ${log.destination_ip || "10.0.0.1"}:443 HTTP/1.1`;
            status = 404; // Port closed/scan
        }

        const timestamp = formatApacheDate(log.timestamp);
        const message = log.description || "-";

        // Apache Log Format:
        // IP - - [Date] "Request" Status Size "Message"
        return `${log.source_ip} - - [${timestamp}] "${request}" ${status} ${size} "${message}"`;
    });

    const outputPath = path.join(process.cwd(), "hadoop", "supabase_logs.txt");
    fs.writeFileSync(outputPath, apacheLogs.join("\n"));

    console.log(`Successfully exported logs to ${outputPath}`);
}

fetchAndExportLogs();
