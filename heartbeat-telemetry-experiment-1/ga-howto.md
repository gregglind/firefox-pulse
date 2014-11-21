

# Claim:  Google analyitics tracking is easy.



## Track something.

Must have EXACTLY 4 fields.

* (GA message)
* Event Category,
* Event Action,
* Event Label


```javascript
// This will append the action under the page's URL (no query args or fragment id!)
_gaq.push([
  '_trackEvent',  // message to GA, saying to 'add it'
  'My Interactions',   //  Event CATEGORY.  main silo.  Should be 'big'
  'Element 1',    // Event ACTION
  '5']);          // Event LABEL
```

## Cram in more data

```javascript
// to cram in more data, stringify into ACITON or LABEL
var rating = 5;
var arm = 'stars-polite'
_gaq.push([
  '_trackEvent',  // message to GA, saying to 'add it'
  'My Interactions',   //  Event CATEGORY.  main silo.  Should be 'big'
  'Element 1',    // Event ACTION
  [rating,arm].join(':')]); // Event LABEL
```


## Putting it all together...

(On Ready)

```javascript
// pull the vars out of queryargs
// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript  ... I don't know if we are doing queryargs, or hash or what.
// assuming queryargs!

var qargs = someMagicFunction(window.location.search) // or similar!

// could be fancier by giving each some magical data attribute, or such.
// this is a little brute force
var elids = ['support-video', 'support-other', 'engage-tweet'];
elids.map(funcntion(elid) {
  var category = "heartbeat-telemetry-experiment-1";
  var action = elid;
  var label = [qargs.arm, quargs.rating].join("::"); // or more!
  document.getElementById(elid).addEventListener("click", function (evt) {
    _qaq.push([
      '_trackEvent',
      category,
      action,
      label
    ])
  }
})

```

