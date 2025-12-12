import random
import time
from datetime import datetime, timedelta

def generate_ip():
    return f"{random.randint(10, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}"

def generate_log_entry(timestamp):
    ip = generate_ip()
    endpoints = ["/login", "/admin", "/dashboard", "/api/v1/data", "/contact"]
    status_codes = [200, 401, 403, 404, 500]
    
    # Simulate specific attack patterns
    attack_type = random.choices(["normal", "brute_force", "port_scan"], weights=[0.7, 0.2, 0.1])[0]
    
    logs = []
    
    if attack_type == "brute_force":
        target_ip = generate_ip()  # Fixed IP for the attack duration
        for _ in range(random.randint(5, 20)):
             # Timestamps close together
            t_str = (timestamp + timedelta(seconds=random.randint(1, 10))).strftime("%d/%b/%Y:%H:%M:%S +0000")
            logs.append(f'{target_ip} - - [{t_str}] "POST /login HTTP/1.1" 401 128 "Invalid credentials"')
            
    elif attack_type == "port_scan":
        target_ip = generate_ip()
        ports = random.sample(range(20, 1024), k=random.randint(5, 15))
        for port in ports:
            t_str = (timestamp + timedelta(seconds=random.randint(1, 5))).strftime("%d/%b/%Y:%H:%M:%S +0000")
            logs.append(f'{target_ip} - - [{t_str}] "CONNECT {target_ip}:{port} HTTP/1.1" 404 0 "-"')

    else: # Normal traffic
        for _ in range(random.randint(1, 5)):
             t_str = (timestamp + timedelta(seconds=random.randint(1, 60))).strftime("%d/%b/%Y:%H:%M:%S +0000")
             endpoint = random.choice(endpoints)
             status = 200 if endpoint != "/admin" else 403
             logs.append(f'{ip} - - [{t_str}] "GET {endpoint} HTTP/1.1" {status} {random.randint(100, 2000)} "-"')

    return logs

def main():
    start_time = datetime.now()
    all_logs = []
    
    # Generate 1 hour of logs
    for i in range(60): 
        current_time = start_time + timedelta(minutes=i)
        for _ in range(random.randint(5, 20)): # Multiple events per minute
            all_logs.extend(generate_log_entry(current_time))
            
    # Shuffle slightly to make it realistic (though Hadoop handles time sorting usually)
    # But for our simple line-by-line generator, creating bursts is fine.
    
    for log in all_logs:
        print(log)

if __name__ == "__main__":
    main()
