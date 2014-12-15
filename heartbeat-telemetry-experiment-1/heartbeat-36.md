
# Proposed Flow For Heartbeat Product V1

(To be implemented in Fx 36)

## Overview

### main loop

1.  ping to Self-Repair Service url to get REPAIR-CODE
2.  Run REPAIR-CODE in a page mod
3.  Filter through all recipes, run code as appopriate, including HEARTBEAT


## Players:

### Self-Repair Server

- https://selfrepair.mozilla.org/index.js  [^self-repair-server] [^recipe-url]

(or)

- url:  https://input.mozilla.org/repair/index.js  [^input-not-robust]
- Self-Repair owns this page, and is responsible for uptime, SLA, validating recipes.   This belongs in User Success, with guidance from #metrics, telemetry, product, etc.
- Deploy/updates/additions can be fast / responsive.


### Engagement Server

- url:  https://mozilla.org/firefox/<???> [^engage-url]

(or backup, if engagement slips )

- https://input.mozilla.org/static/hb/engage/{happy,sad,neutral}.html .

- Engagement owns this page (long-term), and can incorporate GA, Optimizely, etc.  This is a lab for working with pre-screened leads


### Heartbeat Recording Server

- url:  "https://input.mozilla.org/api/v2/hb/",

- For now, User Success owns this service.  Eventually, it should be a Telemetry Packet.

- Please please reuse / replicate the existing flow stage model as per the existing Heartbeat Experiments




## Repair Code Ideas

- big list of recipes, all of which take the same inputs.
- could be a derived / built product (as is `firefox-manifest.json` in TelEx).
- repairs can decide themselves how long to wait to fire.
- (can repairs set onEvent triggers?)

### Inputs desired:

- `about:support`-ish things
- ADD "when in dev cycle" (to allow oversampling during late Beta)
- ADD "time in session" (recorded, to allow various sample correction checking)

## Self repair experience

### main loop

1.  Startup
2.  Wait 1 minute [^why-wait]
3.  ping to Self-Repair Service url to get REPAIR-CODE
4.  Run REPAIR-CODE in a page mod
5.  Filter through all recipes, run code as appopriate
6.  wait PERIOD (30 minutes?) go to 3.  [^re-query]

### hearbeat loop

1.  If user matches 'heartbeat cohort' recipe
2.  (optional setTimout await)
3.  Heartbeat Notification Bar Widget fires, with this arity:

    - which: nps|stars
    - upload_name  (string, like "hearbeat-cohort" or 'heartbeat-beta-oversample')
    - recording_url.
    - question_config?
        - text
        - name
    - engagement-url?

4.  (Signal home that page was offered.)
5.  On RATE, engagement page opens in background tab, and is passed RATING, and QUESTION_TYPE (stars|nps) for appropriate GA outcome tracking and responsive page building.
6.  (Signal home with rating.)


Claim:  having a 'flow.js' state global is useful here for storing which stage a user is in.  This can be reused from existing experiments.  This makes calculating stats around this *much easier* and has state machine checking.

Claim:  Heartbeat should be built with support for multiple Question / widgets *soon*.  Those could be multiple tour methods, a function with arity, etc.  NPS has different styling / elements / build than "stars".

Claim:  Beefing up Notification Bars will be a goodness, and help with UI building.

Claim:  "new style" UI bars are preferred by Gregg and Sevaan.


### other loops

- There may be other experiences / events that trigger Steps 3-6 above, such as 24-hour long timers, debug signals, or signals from OS or who knows what!


## Nice to have

- 'force do' (by pref toggle?) for debug and development of recipes
- configurable privileged recipe server [^alt-location-scary]

## Sampling Goals

- even sample of TOTAL SESSION TIME,  not OVER USERS
- low, consistent background rate.


## Learnings from previous Heartbeat experiments / implementations

- having a `flow.js` state keeper / validator was AWESOME
- validating Heartbeat packets on the way out caught many errors
- configurable 'is_test', urls are great for debug.


## Notes:

- [^self-repair-server]:  this doesn't exist.  IT?  Might actually be the best solution.  Engagement doesn't want to own the worker page, or in-product pages in general.  We (in UA) don't want to be pinned to their release schedule.  A new server would be isolated from both.
- [^recipe-url]:  (Agnostic on the actual url.  Suggestions welcome)
- [^engage-url]:  Not clear yet if they want one page, or 3 or N and what is on each.  That is owned by Winston, Benjamin Sternthal, etc.  UA agnostic on page urls, but they probably care.  One page that can react to score is probably the Right Thing.
- [^input-not-robust]:  Says: < willkg> we can scale it up. but ... it's not that kind of system, yet.
- [^why-wait]:  1 minute is intuitive.  We want to wait until after startup completes, and the user is ready to hear things.  We don't actually have the true distribution of session times, b/c telemetry misses short sessions that never have idle.  Waiting until idle seems wrong for this (same reasons).  5 minutes felt too long.  Getting this Right might be a good goal for 37 or 38.  The question of 'heartbeat interruption context' is separate and should be handled by the heartbeat recipe.
- [^re-query]:  Re-query increased the HTTP load tremendously.  30 minutes there 'feels right'.
- [^alt-location-scary]:  This is also terrifying to have in a pref, and a mondo security hole.  Ideas welcome!




