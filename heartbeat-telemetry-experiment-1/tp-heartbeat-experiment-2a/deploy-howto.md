
1. Copy files in the directory to hg directory for testpilot web

  /testcases/heartbeat-response-tp-experiment-2a

2. fabric:

  fab package:heartbeat-response-tp-experiment-2a,,index.json
  fab test_valid:index.json
  fab push

3. Wait and profit?
