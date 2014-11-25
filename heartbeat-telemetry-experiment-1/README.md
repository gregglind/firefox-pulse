Heartbeat Telemetry Experiment 1
=========================================================

## Invocations

```
# needs fx34+

cfx run -b /Applications/FirefoxAurora.app/ --static-args '{"lateenough": true, "delay": 1000000, "showui": true, "armnumber":5, "phonehome": false}'
```
### Static-args:

* `lateenough`:  run TODAY, to evade sampling / experiment delay.
* `delay`: how long to wait before popping
* `showui`:  open the 'all variations' page
* `armnumber`: 0-5 (see ARMS below).  Override which experiment variation
* `phonehome`: whether to actually phonehome (default=false)
* `reset`:  reset all prefs
* `testing`:  if phonehome, add the testing key (default=true)
* `killafter`:  milliseconds.  addon should remove itself initial run.



## Development

### Building

- needs webpack
  ```
  cd data
  npm install
  ./node_modules/webpack/bin/webpack.js --progress --colors --watch
  ```

- rebuild js for widgets:
  ```
  cd data
  webpack
  ```

If you want progress watchers...

  ```
  ./node_modules/webpack/bin/webpack.js --progress --colors --watch
  # note, will need to be restarted if you 'add' more files
  # or alter webpack config
  ```


## Arms


```
[
  "0 after_a_while.stars-polite.notification_top_global",
  "1 after_a_while.stars-polite.notification_bottom_global",
  "2 after_a_while.stars-direct.notification_top_global",
  "3 after_a_while.stars-direct.notification_bottom_global",
  "4 after_a_while.nps-standard.notification_top_global",
  "5 after_a_while.nps-standard.notification_bottom_global"
]

```
