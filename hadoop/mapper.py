#!/usr/bin/env python3
import sys
import re

# Regex to parse common log format roughly
# Example: 192.168.1.1 - - [12/Dec/2025:10:00:00 +0000] "POST /login HTTP/1.1" 401 128 "Invalid credentials"
LOG_PATTERN = re.compile(r'(\d+\.\d+\.\d+\.\d+) - - \[(.*?)\] "(.*?)" (\d+) (\d+) "(.*?)"')

def main():
    for line in sys.stdin:
        line = line.strip()
        match = LOG_PATTERN.match(line)
        if match:
            ip = match.group(1)
            timestamp = match.group(2)
            request = match.group(3)
            status = int(match.group(4))
            message = match.group(6)
            
            # Detect Failed Login
            if "POST /login" in request and status == 401:
                 print(f"{ip}_LOGIN_FAIL\t1")
                 
            # Detect Potential Port Scan (CONNECT or scanning distinct ports - simplified here by just checking 404s on weird ports or just high volume 404s)
            # In our generator, port scans are CONNECT to various ports returning 404
            elif "CONNECT" in request:
                print(f"{ip}_PORT_SCAN\t1")
                
            # General Activity
            print(f"{ip}_ACTIVITY\t1")

if __name__ == "__main__":
    main()
