/* jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global exports, require, console */

"use strict";


// implements:  https://bugzilla.mozilla.org/show_bug.cgi?id=1092376
//
// Nits / Problems (WONTFIX)
// - smallest page size doesn't hbox around 'children' properly (needs hbox with flex?)
// - Font and icon sizing affects parent.  Thus if other notification showing in
//   queue, will affect it too.
// - no accessibility features AT ALL.
// - retina might look awful.


/**  USAGE
  * Exposes:  `makeNotice(which, overrides)`
  * examples:
  *
  * let o = makeNotice("stars")  // or "nps"
  * let o = makeNotice("nps", {mikestyle: true})
  * let o = makeNotice("stars", {mikestyle: true, msg: "Is Firefox Awesome, or the MOST AWESOME?", minus: "just awesome", plus: "most awesome"})
  * let o = makeNotice("stars", {mikestyle: true, msg: "Is Firefox Awesome, or the MOST AWESOME?", minus: "just awesome", plus: "most awesome", outmsg="Who rules?  YOU DO!  Thanks.", delay: 2000})
  */

/** sources and links
  *
  * mxr.mozilla.org/mozilla-central/source/toolkit/content/widgets/notification.xml
  * https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/notificationbox
  * http://mxr.mozilla.org/mozilla-central/source/toolkit/content/xul.css#183
  * chrome://global/skin/notification.css
  *
  *
  * https://www.surveymonkey.com/blog/en/net-promoter-score-survey-template/
  * http://en.wikipedia.org/wiki/Net_Promoter
  * http://en.wikipedia.org/wiki/Net_Promoter#cite_note-16
  * http://people.mozilla.org/~mmaslaney/prompt/Prompt-spec.png
  *
  * ## NPS criticism
  * http://blog.verint.com/net-promoter-score-nps-criticisms-and-best-practices
  * (suggests 7 point bipolar)
  */

const {getMostRecentBrowserWindow} = require("sdk/window/utils");
const tabs = require("sdk/tabs");
const data = require("sdk/self").data;
const { extend } = require("sdk/util/object");
const querystring = require("sdk/querystring");
const os = require('sdk/system/runtime').OS;

const notification = require("./notification");

const flow = require("flow");
const phonehome = require("phonehome");

let afterPage = require("./after-page");

const sss = require("stylesheetservice");

sss.register(sss.getURI(data.url("icons/iconstyles.css")));


/** Utilities */

let hoverize = function (el, fhover, foff) {
  el.addEventListener("mouseover", fhover);
  el.addEventListener("mouseout", foff);
};

function fragmentFromString (strHTML, document) {
  var frag = document.createDocumentFragment();
  //var html = '<div>x</div><span>y</span>';
  var holder = document.createElement("div");
  holder.innerHTML = strHTML;
  var ii;
  for (ii = 0; ii < holder.childElementCount; ii++) {
    ////console.log(ii);
    ////console.log(holder.children[ii]);
    frag.appendChild(holder.children[ii]);
  }
  return (frag);
}

function styleEl (el, styles, unset ) {
  for (let k in styles) {
    let ans = unset ? 'inherit' : styles[k];
    //console.log("styling", k, ans);
    el.style[k] = ans;
  }
}


/** Notification Bar Overview
  *
  * 1.  Append Notification (creating by side effect)
  * 2.  Modify that notification
  *
  * Problems:
  *
  * 1.  Possible: temporarily visible non widgeted bar
  * 2.  Affects box styling of other events in the queue
  */

let starchar = "★";
let staroff = data.url("icons/star.svg");
let starlit = data.url("icons/star-lit.svg");

let makeStarElString = function (n) {
  let out = [];
  for (let ii = 0; ii < n; ii++) {
    let j = ii+1;
    out.push(`<span class="star-x" style="background-repeat: no-repeat; background-size: 24px 24px; cursor: pointer; width:24px; height:24px; background-image: url(${staroff})" data-score="${j}" id="star${j}"></span>`);
  }
  return out;
};

let makeNpsString = function () {
  let n = 11;
  let out = [];
  for (let ii = 0; ii < n; ii++) {
    let j = ii;
    out.push(`<span class="star-x" data-score="`+ j +`" style="cursor: pointer; border: 1px solid #C1C1C1;  width: 28px; height:28px; border-radius: 0px; margin: 0px 0px; display: table-cell; vertical-align: middle; text-align: center;" id="star`+ j +`">`+ ii +`</span>`);
  }
  return out;
};

let defaultBarConfig = {
  "stars": {
    "msg": "Rate Firefox",
    plus: "+", // nice plus
    minus: "−",   // nice minus
    // should this be a fn?
    widgetstring:  makeStarElString(5 /*nstars*/).join("\n"),
    widgetLitStyles: {
      backgroundImage:  "url(" + starlit + ")"
    },
    widgetUnlitStyles: {
      backgroundImage:  "url(" + staroff + ")"
    },
    _v: "stars.v1"
  },
  "nps": {
    "msg": "How likely are you to recommend Firefox to others?", // msg,
    plus: "extremely", // nice plus
    minus:"not at all",   // nice minus
    widgetstring:  makeNpsString().join("\n"),
    widgetLitStyles: {
      backgroundColor: "#DADADA", // "#EBEBEB",
    },
    widgetUnlitStyles: {
      backgroundColor: "#FBFBFB",
    },
    _v:  "nps.v1"
  }
};


// implements (partial) http://people.mozilla.org/~mmaslaney/prompt/Prompt-spec.png
let mikestyle = {
  // osx
  notice:  {
    color: '#333333',
    fontWeight: "normal",
    fontFamily: "Lucida Grande, Segoe, Ubuntu",
    //lineHeight: "16px", // in spec, ignoring
    background: "#F1F1F1",
    backgroundImage:  ['inherit', 'linear-gradient(-179deg, #FBFBFB 0%, #EBEBEB 100%)'][!!(os.toLowerCase() === "darwin")], // no image!
    boxShadow: "0px 1px 0px 0px rgba(0,0,0,0.35)"
  },
  messageText: {
    fontWeight: "normal",
    fontFamily: "Lucida Grande",
    //fontSize: "11.5px", // in spec, ignoring.
    color: '#333333',
    //lineHeight: "16px", // in spec, ignoring
  },
  exit: {
    marginLeft: "10px"
  },
  messageImage: {
    marginRight: "10px"
  }
};


let baseEngageUrl = "https://input.mozilla.org/static/hb/experiment1/";

let openEngagementPage = exports.openEngagementPage = function(which, score, qargs) {
  let urlargs = extend({}, qargs, {rating: score});
  let urlize = (s, qargs) => baseEngageUrl + s + "?" + querystring.stringify(qargs);

  let urls = {
    sad:  urlize("sad.html", urlargs),
    happy: urlize("happy.html", urlargs),
    neutral: urlize("neutral.html", urlargs)
  };

  let mood;
  let openpage = (url) => tabs.open({url: url, inBackground: true});
  switch (which) {
    case "nps":
      if (score <=6) mood = "sad";
      else if (score <= 8) mood = "neutral";
      else mood = "happy";
      break;
    case "stars":
      if (score <=3) mood = "sad";
      else if (score <= 4) mood = "neutral";
      else mood = "happy";
      break;
    default:
      throw "No engagement targets for " + which;
  }

  let url = urls[mood];
  if (!afterPage.afterPageRe.test(url)) { throw "after page url wont be modded: " + url }

  afterPage.factory({mood: mood}); // page mod
  openpage(url);
};


/** arg checking */
let mustBeOneOf = function (name, choices_array, thing) {
  if (choices_array.indexOf(thing) < 0) {
    throw name + " must be one of " + choices_array.join("|");
  }
};

let mustDefined = (x) => {if (x === undefined) {throw "must be defined";}};


/** create question noficiation bars
  *
  *  Arguments:
  *  - which    : nps|stars
  *  - flowid   : (string, closed into engagement page)
  *  - barytype : top-global|bottom-global
  *  - overrides :
  *       - mikestyle:  bool
  *       - msg      :  string
  *       - icon     :  heart|fx|question  or url
  *
  *  Returns object {
  *    win: win,
  *    box: box,
  *    scoreEl: scoreEl,
  *    notice: notice,
  *    which: which,
  *    messageImage: messageImage,
  *    messageText: messageText,
  *    closeButton: closeButton,
  *    config:  conf
  *  };
  */
let makeNotice = function (which, flowid, bartype, overrides) {
  if (overrides === undefined) overrides = {};

  mustDefined(flowid);
  mustDefined(which);
  mustDefined(bartype);
  mustBeOneOf("which", ["nps","stars"], which);
  mustBeOneOf("bartype", ["top-global", "bottom-global"], bartype);

  // should we mixin the overrides over the conf?
  // TODO, maybe after one more :)

  let conf = defaultBarConfig[which];
  conf = extend({}, conf, overrides);

  //console.log('makeNotice', conf);
  let iconsByAlias = {
    question: "chrome://global/skin/icons/question-large.png",
    heart: data.url("icons/heartbeat-icon.png"),
    fx: data.url("icons/firefox-highres.png")
  };

  let icon = iconsByAlias.fx;
  if (overrides.icon) {
    icon = iconsByAlias[overrides.icon] || overrides.icon; // url path!
  }

  let options = [
    overrides.msg || conf.msg, // msg,
    null, // id,
    icon, // icon,
    1, // priority,
    null, // buttons,
    function () {  // cb on close!
      styleEl(messageImage, {width: "36px", height: "36px"}, true); // reset

      //      let info = extend({},
      //        Q,
      //        {
      //          flowid: flowid,
      //          msg: 'flow-ui-closed'
      //        });
      //      phonehome(info);
    }
  ];

  let win = getMostRecentBrowserWindow();
  let document = win.document;

  // notification
  let box;
  switch (bartype) {
    case "top-global":
    case "bottom-global":
      box = notification.notificationbox(win, bartype);
      break;
    default:
      throw "bartype: " + bartype + " not allowed."; // oneOf should cover this
  }

  //box.removeAllNotifications();

  let notice = box.appendNotification.apply(box,options);

  let messageImage = document.getAnonymousElementByAttribute(notice, "class", "messageImage");
  let messageText = document.getAnonymousElementByAttribute(notice, "class", "messageText");
  let closeButton = document.getAnonymousElementByAttribute(notice, "class", "messageCloseButton close-icon tabbable");

  styleEl(messageImage, {width: "36px", height: "36px"});

  let starstring = `<span id="star"> ` + conf.widgetstring + `</span>`;
  // put it on!
  let starry = fragmentFromString(starstring, document);

  let moreEl = document.createElement("span");
  moreEl.textContent = overrides.plus || conf.plus;
  let lessEl = document.createElement("span");
  lessEl.textContent = overrides.minus || conf.minus;

  // style more and less
  [moreEl, lessEl].map((el) => {
    el.style.padding="0px 5px";
    el.style.opacity = '.5';
  });

  switch (which) {
    case "nps":
      notice.style.fontSize="14px";
      notice.style.lineHeight="16px";
      break;
    case "stars":
      notice.style.fontSize="14px";
      notice.style.lineHeight="16px";

      // shrink plus / minus
      moreEl.style.fontSize = "12px";
      lessEl.style.fontSize = "12px";

      // hide them.
      moreEl.style.display = "none";
      lessEl.style.display = "none";
      break;
  }

  // move the flexer // maybe stars only
  if (which === "stars") {
    let spacer = messageText.nextSibling;
    spacer.setAttribute("flex", 20); // 20x as much as on the message.
    // this should remove most of the gap between message and stars.
    messageText.parentElement.appendChild(spacer.cloneNode());
    spacer.remove();  // is this destroyed?
  }

  notice.appendChild(lessEl);
  notice.appendChild(starry);
  notice.appendChild(moreEl);

  // show counter (not using)
  let scoreEl = document.createElement("span");
  scoreEl.id="score";
  scoreEl.textContent = '';
  notice.appendChild(scoreEl);
  scoreEl.style.width="24px";
  scoreEl.style.textAlign = "center";
  scoreEl.style.margin = "0px 10px";
  scoreEl.style.display = "none"; // would be 'block'

  // name of this button set
  let starEl = notice.children.star;
  //starEl.style.marginRight="24px";

  // HOVER sets stars

  (function (el, litStyles, unlitStyles) {
    let starEls = el.getElementsByClassName("star-x");
    let nstars = starEls.length;

    function setStars(min, max){
      //console.log('setStars',n);

      Array.forEach(starEls, function(el){
        var i = /star(.*)/.exec(el.id)[1];
        i = Number(i, 10);
        // switch lit and unlit styles
        if ((min <= i) && (i <= max)) {
          styleEl(el, unlitStyles, false);
          styleEl(el, litStyles);
          //el.classList.add("star-on");
        } else {
          styleEl(el, litStyles, true);
          styleEl(el, unlitStyles);
          //el.classList.remove("star-on");
        }
      });
    }

    // hover for each star.
    Array.forEach(starEls,function(el){
      var n = /star(.*)/.exec(el.id)[1];
      n = Number(n,10);
      el.addEventListener("mouseover", function (evt) {
        ////console.log("hover on",evt.target.id);
        //console.log(n);
        if (which === "nps") {
          setStars(n, n);
        } else {
          setStars(0,n);
        }
        // set score
        scoreEl.textContent = n;
        scoreEl.style.opacity = "" + (n / nstars);
        scoreEl.style.color = "#0095ED";
      });
      el.addEventListener("mouseout", function (evt) {
        ////console.log("hover on",evt.target.id);
        setStars(-1, -1);
        // set score
        scoreEl.textContent = "";
        //scoreEl.style.opacity = "" + (n / nstars);
        //scoreEl.style.color = "#0095ED";
      });

    });
  })(starEl, conf.widgetLitStyles, conf.widgetUnlitStyles);

  // click emits and closes the bar.
  starEl.addEventListener("click", function (evt) { /*weak*/
    let s = evt.target.getAttribute("data-score");
    let rating = Number(s, 10);
    console.log('you rated:', s, evt.target.id);

    // thank you.
    notice.image = iconsByAlias.heart;
    notice.label = overrides.outmsg || conf.outmsg || "Thank you for making Firefox better!";

    // todo add a pulse on the new icon.  cant figure out how :(

    // empty it
    while (notice.firstChild) {
      notice.removeChild(notice.firstChild);
    }
    let delay = overrides.delay || conf.delay || 1500;

    flow.voted();
    flow.rate(rating);
    flow.persist();
    phonehome.phonehome();

    openEngagementPage(which, rating, {flowid: flowid, armname: conf.armname});
    win.setTimeout(() => {
      // TODO, pulsing here is desired, but didn't work GRL
      // messageImage.classList.remove('animatetwice',"pulse");
      box.removeCurrentNotification();
    }, delay);
  });

  if (overrides && overrides.mikestyle) {
    console.log("overriding styles");
    styleEl(notice, mikestyle.notice);
    styleEl(messageText, mikestyle.messageText);
    styleEl(closeButton, mikestyle.exit);
    styleEl(messageImage, mikestyle.messageImage);
  }

  // icon bleed
  //messageImage.style.margin = "-10px 10px -20p -12px";

  messageImage.classList.add('animateonce',"pulse");

  // should return the options / overrides maybe?
  return {
    win: win,
    box: box,
    scoreEl: scoreEl,
    notice: notice,
    which: which,
    messageImage: messageImage,
    messageText: messageText,
    closeButton: closeButton,
    config:  conf
  };
};

exports.makeNotice = makeNotice;

