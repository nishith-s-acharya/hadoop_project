-- Analysis using default database
set hive.execution.engine=mr;

-- Simple analysis: Count incidents by status code to identify attacks
-- 401 = Failed Login / Brute Force
-- 404 = Port Scan (probing for non-existent paths)
-- 200 = Normal or Successful compromised access

INSERT OVERWRITE LOCAL DIRECTORY 'hadoop/hive_output'
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
SELECT 
  ip, 
  `timestamp`, 
  method,
  path,
  protocol,
  status, 
  CASE 
    WHEN status = 401 THEN 'Failed_Login'
    WHEN status = 404 THEN 'Port_Scan'
    ELSE 'Other'
  END as threat_type
FROM threat_logs
WHERE status IN (401, 404)
LIMIT 100;
