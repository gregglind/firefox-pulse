Firefox Pulse Uptake Rate Experiment Addon (Test Pilot)
=========================================================



Development
===============

- needs webpack
  ```
  npm install -g webpack
  npm install style-loader css-loader url-loader
  ```

- rebuild js for widgets:
  ```
  cd data
  webpack
  ```

If you want progress watchers...

  ```
  webpack --progress --colors --watch &
  # note, will need to be restarted if you 'add' more files
  # or alter webpack config
  ```


Arms
=======

```
  "0 after_a_while$rate-firefox$panel_big",
  "1 after_a_while$rate-firefox$panel_small",
  "2 after_a_while$rate-firefox$panel_big_unnachored",
  "3 after_a_while$rate-firefox$notification_top",
  "4 after_a_while$rate-firefox$notification_bottom",
  "5 after_a_while$rate-firefox$background_tab",
  "6 after_a_while$recommend$panel_big",
  "7 after_a_while$recommend$panel_small",
  "8 after_a_while$recommend$panel_big_unnachored",
  "9 after_a_while$recommend$notification_top",
  "10 after_a_while$recommend$notification_bottom",
  "11 after_a_while$recommend$background_tab",
  "12 after_a_while$satisfied$panel_big",
  "13 after_a_while$satisfied$panel_small",
  "14 after_a_while$satisfied$panel_big_unnachored",
  "15 after_a_while$satisfied$notification_top",
  "16 after_a_while$satisfied$notification_bottom",
  "17 after_a_while$satisfied$background_tab",
  "18 newtab$rate-firefox$panel_big",
  "19 newtab$rate-firefox$panel_small",
  "20 newtab$rate-firefox$panel_big_unnachored",
  "21 newtab$rate-firefox$notification_top",
  "22 newtab$rate-firefox$notification_bottom",
  "23 newtab$rate-firefox$background_tab",
  "24 newtab$recommend$panel_big",
  "25 newtab$recommend$panel_small",
  "26 newtab$recommend$panel_big_unnachored",
  "27 newtab$recommend$notification_top",
  "28 newtab$recommend$notification_bottom",
  "29 newtab$recommend$background_tab",
  "30 newtab$satisfied$panel_big",
  "31 newtab$satisfied$panel_small",
  "32 newtab$satisfied$panel_big_unnachored",
  "33 newtab$satisfied$notification_top",
  "34 newtab$satisfied$notification_bottom",
  "35 newtab$satisfied$background_tab"
```
