Analysis
================

```
lines.sorted.txt # lines from fhr sorted on (personid,timestamp)
  # needed b/c some lines are missing flowids, which we infer.

```

## final pipeline

1. Flow-aware
2. Lots of nits fixed.

```
cat lines.sorted.txt | python pulse_ui_setup_R.py &> pulse.experiment.data.log
```

## old pipeline:

1. coarse
2. powered initial report

```
cat pulse.txt | cut -f2 | python pulse_ui_test_report.py  > report1.txt
(tail -n37 report1.txt | head -n1; (tail -n36 report1.txt  | align  -allln | sort -rn -k4,4))| align -alln
```
