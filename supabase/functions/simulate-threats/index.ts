import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const threatTypes = ['failed_login', 'port_scan', 'brute_force', 'malware', 'ddos'];
const severities = ['low', 'medium', 'high', 'critical'];
const protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'SSH', 'FTP'];
const locations = [
  { city: 'Moscow', country: 'Russia', code: 'RU' },
  { city: 'Beijing', country: 'China', code: 'CN' },
  { city: 'Pyongyang', country: 'North Korea', code: 'KP' },
  { city: 'Tehran', country: 'Iran', code: 'IR' },
  { city: 'Lagos', country: 'Nigeria', code: 'NG' },
  { city: 'São Paulo', country: 'Brazil', code: 'BR' },
  { city: 'Mumbai', country: 'India', code: 'IN' },
  { city: 'Unknown', country: 'TOR Exit Node', code: 'XX' },
];

const descriptions: Record<string, string[]> = {
  failed_login: [
    'Multiple failed SSH authentication attempts detected',
    'Repeated login failures from suspicious IP',
    'Credential stuffing attack detected',
    'Failed admin panel login attempt',
    'Brute force password guessing detected',
  ],
  port_scan: [
    'Sequential port scanning detected',
    'SYN scan activity from external host',
    'Aggressive network reconnaissance',
    'Full port range scan detected',
    'Stealth port scan identified',
  ],
  brute_force: [
    'Automated brute force attack in progress',
    'High-volume authentication attempts',
    'Dictionary attack against SSH service',
    'RDP brute force attempt detected',
    'API endpoint brute force detected',
  ],
  malware: [
    'Malicious payload download attempted',
    'Trojan communication pattern detected',
    'Ransomware encryption behavior identified',
    'Cryptominer process detected',
    'Botnet C2 communication blocked',
  ],
  ddos: [
    'Volumetric DDoS attack detected',
    'SYN flood attack in progress',
    'UDP amplification attack',
    'Application layer DDoS detected',
    'DNS amplification attack blocked',
  ],
};

function randomIP(): string {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function randomPort(): number {
  const commonPorts = [22, 23, 80, 443, 3306, 3389, 5432, 8080, 8443];
  return Math.random() > 0.5 ? commonPorts[Math.floor(Math.random() * commonPorts.length)] : Math.floor(Math.random() * 65535);
}

function generateThreat(forcedType?: string) {
  const threatType = forcedType || threatTypes[Math.floor(Math.random() * threatTypes.length)];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const protocol = protocols[Math.floor(Math.random() * protocols.length)];
  const descList = descriptions[threatType] || descriptions['failed_login']; // Fallback
  const description = descList[Math.floor(Math.random() * descList.length)];

  return {
    source_ip: randomIP(),
    destination_ip: randomIP(),
    threat_type: threatType,
    severity,
    description,
    location: `${location.city}, ${location.country}`,
    country_code: location.code,
    port: randomPort(),
    protocol,
    status: 'active',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { count = 1, type = 'all' } = await req.json().catch(() => ({ count: 1, type: 'all' }));
    const threatCount = Math.min(Math.max(1, count), 20); // increased limit to 20

    const threats = Array.from({ length: threatCount }, () =>
      generateThreat(type !== 'all' ? type : undefined)
    );

    const { data, error } = await supabase
      .from('threat_logs')
      .insert(threats)
      .select();

    if (error) {
      console.error('Error inserting threats:', error);
      throw error;
    }

    console.log(`Generated ${threatCount} threat(s)`);

    return new Response(
      JSON.stringify({ success: true, count: threatCount, threats: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in simulate-threats:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
