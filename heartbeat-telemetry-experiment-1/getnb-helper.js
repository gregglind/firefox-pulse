/* jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global exports, require, console, Cc, Ci */

/** usage
  - on pages like the ui-debug page, use this to get current top bar notice
    for styling and debugging
  - must be used from a priv'd page, like about:addons
*/

let getnb = function () {
  let BROWSER = 'navigator:browser';
  let WM = Cc['@mozilla.org/appshell/window-mediator;1'].
             getService(Ci.nsIWindowMediator);

  function getMostRecentWindow(type) {
    return WM.getMostRecentWindow(type);
  }

  function getMostRecentBrowserWindow() {
    return getMostRecentWindow(BROWSER);
  }

  let win = getMostRecentBrowserWindow();
  // noficication
  let box = win.document.getElementById("high-priority-global-notificationbox");

  let notice = box.currentNotification;

  let messageImage = document.getAnonymousElementByAttribute(notice, "class", "messageImage");
  let messageText = document.getAnonymousElementByAttribute(notice, "class", "messageText");
  let closeButton = document.getAnonymousElementByAttribute(notice, "class", "messageCloseButton close-icon tabbable");

  return {
    win: win,
    box: box,
    //scoreEl: scoreEl,
    notice: notice,
    //which: which,
    messageImage: messageImage,
    messageText: messageText,
    closeButton: closeButton
  };
};

let loop = (thing, fn) [].forEach.call(thing, fn);

