# Heartbeat Telemetry Experiment

## Goals

1.  Test Response Rate, Rating Distribution, Engagment rates of different customer satisfaction rating experinces.

## Runtime Overview

(per `lib/index.js`, `lib/experiment.js`, `lib/arms.js`)

1. startup.

    a. if 'has been long enough', self-uninstall.
    b. if already ran experiment (through showing UI). QUIT.

2. If (first install), configure, else 'revive' saved config from prefs
3. run experiment based on config.

    a. set context trigger
    b. trigger 'rating' ui
    c. record vote (if any)
    d. open instrumented engagement page

## Files

- lib/arms.js  : UX variations
- lib/experiment.js  : main runner logic, independent of arm.  Setup / teardown
- lib/FHR.js  : Thin shim around FHR Reporter.  Isolates XPCOM call.
- lib/flow.js : Singleton / access for `flow` state.
- lib/index.js  :  Addon main function.  sdk `static-args` handling.
- lib/micropilot-trimmed.js  : utilities - snoop(), killaddon()
- lib/personinfo.js : more utilities / heuristics over FHR, system, prefs.
- lib/phonehome.js  : data uploader. Reports to Input Heartbeat
- lib/triggers.js  : Contexts for UI launch.  (1) "After a while"
- lib/ui/after-page.js  : Old "after" page.  DEPRECATED
- lib/ui/notification.js  :  Shims around getting nofication boxes.
- lib/ui/question-bars.js  : UI.  "new style" stars / net promoter bits.
- lib/ui/ui-demo.js :  Old demo screen (DEPRECATED)
- lib/ui.js : UI constructors / Factories.  Bind flow specifics into UX
- lib/upload-validate.js:  Validator for data upload.
- lib/utils.js : uuid() and other small utils.



## Example build  (34+)
```
cfx run -b /Applications/FirefoxAurora.app/ --static-args '{"delay": 100, "armnumber":5, "phonehome": true}' #  for example
```
