/*

Firefox PULSE


OCCASSIONALLY,
ask people how firefox is going?

https://github.com/bwinton/SnoozeTabs/blob/master/lib/main.js#L53

https://bugzilla.mozilla.org/show_bug.cgi?id=878877

*/


console.log("starting");

const chrome = require("chrome");

const data = require("sdk/self").data;
const {Panel} = require("sdk/panel");


let msgPanel = Panel({
  width: 240,
  height: 350,
  contentURL: data.url('message1.html'),
  contentScriptFile: data.url('pulse.js'),
  onShow: function () {
  },
  onHide: function () {
    show();
  }
});

console.log("getting there");


/**  https://github.com/bwinton/SnoozeTabs/blob/master/lib/main.js#L53
* The things I do to get an attached panel to show up. Seriously.
*/
var showWidgetPanel = function (widget) {
  var wm = chrome.Cc["@mozilla.org/appshell/window-mediator;1"]
                     .getService(chrome.Ci.nsIWindowMediator);
  var win = wm.getMostRecentWindow("navigator:browser");
  var widgetElem = win.document.getElementById("widget:" + id + "-" + widget.id);
  widget.panel.show(null, widgetElem);
};


let anchor = function () {
  var wm = chrome.Cc["@mozilla.org/appshell/window-mediator;1"]
                     .getService(chrome.Ci.nsIWindowMediator);
  var win = wm.getMostRecentWindow("navigator:browser");
  return win.document.getElementById("PanelUI-button");
}


let show = function () {
  msgPanel.show({}, anchor());
}

show();

require("tabs").open(data.url("message1.html"))

console.log("done");