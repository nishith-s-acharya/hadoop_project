#!/usr/bin/env python3
import sys
import json

def main():
    current_key = None
    current_count = 0
    
    results = {
        "brute_force_ips": [],
        "port_scan_ips": [],
        "total_activity": {}
    }

    # standard Hadoop streaming reducer loop
    for line in sys.stdin:
        line = line.strip()
        try:
            key, count = line.split('\t', 1)
            count = int(count)
        except ValueError:
            continue

        if current_key == key:
            current_count += count
        else:
            if current_key:
                # Process the previous key
                process_key(current_key, current_count, results)
            current_key = key
            current_count = count

    # Process final key
    if current_key:
        process_key(current_key, current_count, results)
        
    print(json.dumps(results, indent=2))

def process_key(key, count, results):
    if "_LOGIN_FAIL" in key:
        ip = key.replace("_LOGIN_FAIL", "")
        # Threshold for brute force
        if count >= 5: 
            results["brute_force_ips"].append({"ip": ip, "failed_attempts": count})
            
    elif "_PORT_SCAN" in key:
        ip = key.replace("_PORT_SCAN", "")
        # Threshold for port scan
        if count >= 5:
            results["port_scan_ips"].append({"ip": ip, "scan_attempts": count})
            
    elif "_ACTIVITY" in key:
        ip = key.replace("_ACTIVITY", "")
        results["total_activity"][ip] = count

if __name__ == "__main__":
    main()
