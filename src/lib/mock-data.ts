export interface ThreatLog {
  id: string;
  timestamp: Date;
  type: 'failed_login' | 'port_scan' | 'brute_force' | 'malware' | 'ddos';
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceIP: string;
  targetIP: string;
  port?: number;
  details: string;
  country: string;
}

export interface ThreatStats {
  failedLogins: number;
  portScans: number;
  bruteForceAttempts: number;
  malwareDetected: number;
  ddosAttacks: number;
  totalThreats: number;
  criticalAlerts: number;
}

const countries = ['Russia', 'China', 'North Korea', 'Iran', 'Brazil', 'Nigeria', 'Ukraine', 'Romania', 'Vietnam', 'Indonesia'];
const targetIPs = ['192.168.1.1', '10.0.0.50', '172.16.0.100', '192.168.0.254', '10.10.10.1'];

function generateRandomIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function generateThreatLog(index: number): ThreatLog {
  const types: ThreatLog['type'][] = ['failed_login', 'port_scan', 'brute_force', 'malware', 'ddos'];
  const severities: ThreatLog['severity'][] = ['low', 'medium', 'high', 'critical'];
  const type = types[Math.floor(Math.random() * types.length)];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  
  const detailsMap: Record<ThreatLog['type'], string[]> = {
    failed_login: [
      'SSH authentication failure for user root',
      'Invalid credentials for admin account',
      'Multiple failed attempts from same source',
      'Credential stuffing detected',
    ],
    port_scan: [
      'SYN scan detected on ports 1-1024',
      'UDP port sweep detected',
      'Stealth scan identified',
      'Full port range scan in progress',
    ],
    brute_force: [
      'Password spray attack detected',
      'Dictionary attack on SSH service',
      'RDP brute force attempt',
      'Hydra tool signature detected',
    ],
    malware: [
      'Trojan.GenericKD detected',
      'Ransomware signature matched',
      'Cryptominer activity detected',
      'C2 beacon communication blocked',
    ],
    ddos: [
      'SYN flood attack mitigated',
      'UDP amplification detected',
      'HTTP flood from botnet',
      'Volumetric attack threshold exceeded',
    ],
  };

  return {
    id: `threat-${Date.now()}-${index}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000),
    type,
    severity,
    sourceIP: generateRandomIP(),
    targetIP: targetIPs[Math.floor(Math.random() * targetIPs.length)],
    port: Math.floor(Math.random() * 65535),
    details: detailsMap[type][Math.floor(Math.random() * detailsMap[type].length)],
    country: countries[Math.floor(Math.random() * countries.length)],
  };
}

export function generateThreatLogs(count: number): ThreatLog[] {
  return Array.from({ length: count }, (_, i) => generateThreatLog(i))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateThreatStats(): ThreatStats {
  const failedLogins = Math.floor(Math.random() * 500) + 100;
  const portScans = Math.floor(Math.random() * 200) + 50;
  const bruteForceAttempts = Math.floor(Math.random() * 150) + 30;
  const malwareDetected = Math.floor(Math.random() * 20) + 5;
  const ddosAttacks = Math.floor(Math.random() * 10) + 1;
  
  return {
    failedLogins,
    portScans,
    bruteForceAttempts,
    malwareDetected,
    ddosAttacks,
    totalThreats: failedLogins + portScans + bruteForceAttempts + malwareDetected + ddosAttacks,
    criticalAlerts: Math.floor(Math.random() * 15) + 5,
  };
}

export function generateTimeSeriesData() {
  const hours = 24;
  const data = [];
  
  for (let i = hours; i >= 0; i--) {
    const time = new Date(Date.now() - i * 3600000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      failedLogins: Math.floor(Math.random() * 50) + 10,
      portScans: Math.floor(Math.random() * 30) + 5,
      bruteForce: Math.floor(Math.random() * 20) + 2,
    });
  }
  
  return data;
}

export function generateGeoData() {
  return countries.map(country => ({
    country,
    attacks: Math.floor(Math.random() * 500) + 50,
    percentage: Math.floor(Math.random() * 30) + 5,
  })).sort((a, b) => b.attacks - a.attacks);
}
