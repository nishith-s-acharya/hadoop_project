-- Using default database for simplicity in embedded mode
-- Define external table pointing to our HDFS logs
-- Using RegexSerDe to parse the Apache Access Log format
CREATE EXTERNAL TABLE IF NOT EXISTS threat_logs (
  ip STRING,
  `timestamp` STRING,
  method STRING,
  path STRING,
  protocol STRING,
  status INT,
  size INT,
  message STRING
)
ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.RegexSerDe'
WITH SERDEPROPERTIES (
  "input.regex" = "^(\\S+) \\S+ \\S+ \\[([\\w:/]+\\s[+\\-]\\d{4})\\] \"(\\S+)\\s?(\\S+)?\\s?(\\S+)?\" (\\d{3}) (\\S+) \"(.*)\"$"
)
STORED AS TEXTFILE
LOCATION '/Users/nishiths/Developer/threddy_hadoop/hdfs_data/logs';
