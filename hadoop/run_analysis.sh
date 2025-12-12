#!/bin/bash

# 1. Set Java 17 (Required for Hadoop on this machine)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Ensure scripts are executable
chmod +x hadoop/log_generator.py
chmod +x hadoop/mapper.py
chmod +x hadoop/reducer.py

echo "Step 1: Fetching Logs from Supabase..."
# Fetch from real database and convert to access_logs format
bun hadoop/fetch_logs.ts
# Check if logs were created
if [ ! -f hadoop/supabase_logs.txt ]; then
    echo "Warning: No Supabase logs found. Falling back to synthetic generator."
    python3 hadoop/log_generator.py > hadoop/access_logs.txt
    INPUT_FILE="hadoop/access_logs.txt"
else
    echo "Using Supabase logs."
    INPUT_FILE="hadoop/supabase_logs.txt"
fi

echo "Step 2: preparing HDFS (Local Standalone Mode)..."
# Use a local directory 'hdfs_data' to avoid permission issues with /user/ root
hdfs dfs -mkdir -p hdfs_data/logs
hdfs dfs -put -f $INPUT_FILE hdfs_data/logs/
# Remove previous output
rm -rf hdfs_data/output

echo "Step 3: Running Hadoop Analysis (Streaming Jar)..."
hadoop jar $HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-*.jar \
    -files hadoop/mapper.py,hadoop/reducer.py \
    -mapper "python3 mapper.py" -reducer "python3 reducer.py" \
    -input hdfs_data/logs/$(basename $INPUT_FILE) \
    -output hdfs_data/output

echo "Step 4: Publishing Results to Frontend..."
# The output file part-00000 contains the JSON printed by the reducer
if [ -f hdfs_data/output/part-00000 ]; then
    cp hdfs_data/output/part-00000 public/analysis_results.json
    echo "Success! Results updated on the dashboard."
else
    echo "Error: Output file not found. Hadoop job might have failed."
fi

echo "Step 5: Running Hive SQL Analysis..."

# Run Schema Init and Analysis in a single embedded session to ensure persistence
cat hadoop/hive_schema.hql hadoop/hive_analysis.hql | beeline -u "jdbc:hive2:///"

echo "Hive analysis complete. Results in hadoop/hive_output/"
