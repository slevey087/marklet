javascript:(function(){

/* Define Marklet Options and Includes */
var options = {};

var codeToRun = function(deleter){
/* Put Main Bookmarklet Code Here */
};

marklet(options, codeToRun);

/* Marklet Source Code Below, Do Not Edit */
function marklet(e,t){"use strict";function n(t){e.logging&&!u&&console.log(t)}function i(e,t){if("function"==typeof e&&!u)return e(t)}function o(e,t){return u?Promise.reject():Array.isArray(e)?Promise.all(e.map(function(e){return o(e,t)})):"function"==typeof e.skipCondition&&l(e.skipCondition,!1)?(n("Skip condition met, skipping "+e.id),Promise.resolve()):t(e).then(function(){if(e.hasOwnProperty("then"))return o(e.then,t)},function(r){return i(e.onFail,r),e.hasOwnProperty("catch")?(n("Error with include: "+e.id+". Attempting alternate branch."),o(e.catch,t).catch(function(t){return e.required?Promise.reject(t):(n("Error with non-essential include: "+e.id+" and its alternates. Continuing."),Promise.resolve())})):e.required?Promise.reject("Required include "+e.id+" encountered an error. Marklet aborted."):(n("Error with non-essential include: "+e.id+". Continuing."),Promise.resolve())})}function r(t,o){return u?Promise.reject():new Promise(function(r,c){var l=t.id,u=o?t.backupUrl:t.url;l||(l="marklet"+a.toString(),a++);var s=document;if(s.getElementById(l))n(l+" tag already present"),e.rejectIdConflict?c(l+" ID conflict rejected. Marklet aborted."):r();else{var m=s.createElement("script");m.src=u,m.id=l,n("Fetching script: "+l),s.body.appendChild(m),i(t.onFetch);var f=setTimeout(function(){n("Timeout on script: "+l),m.parentNode.removeChild(m),c(),i(t.onTimeout)},e.timeout);m.addEventListener("load",function(){n("Success with script: "+l),clearTimeout(f),d.push(l),r(),i(t.onLoad)}),m.addEventListener("error",function(e){n("Error with script: "+l+". Err: "),n(e),clearTimeout(f),m.parentNode.removeChild(m),c(e),i(t.onError,e)})}})}function c(t,o){return u?Promise.reject():new Promise(function(r,c){var l=o?t.backupUrl:t.url,u=t.id;if(u||(u="marklet"+a.toString(),a++),document.getElementById(u))n(u+" tag already present"),e.rejectIdConflict?c(u+" ID conflict rejected. Marklet aborted."):r();else{var s=document.createElement("link");s.id=u,s.rel="stylesheet",s.type="text/css",s.href=l,n("Fetching style: "+u),document.getElementsByTagName("head")[0].appendChild(s),i(t.onFetch);var m=setTimeout(function(){n("Timeout on style: "+u),s.parentNode.removeChild(s),c(),i(t.onTimeout)},e.timeout);s.addEventListener("load",function(){n("Success with style: "+u),clearTimeout(m),d.push(u),r(),i(t.onLoad)}),s.addEventListener("error",function(e){n("Error with style: "+u+". Err: "),n(e),clearTimeout(m),s.parentNode.removeChild(s),c(e),i(t.onError,e)})}})}function l(e,t){return"function"!=typeof e?(n("No condition given."),!t||Promise.resolve()):(n("Testing code "+e),t?new Promise(function(t,i){e()?(n("Success with "+e),t()):i()}):e()?(n("Success with "+e),!0):void 0)}e.timeout=e.timeout||1e4,e.tickLength=e.tickLength||100,e.localStyleId=e.localStyleId||"markletLocalCss";var a=1,u=!1,d=[],s=setInterval(function(){n("Tick")},e.tickLength),m=o(e.scripts,function(t){return!1!==t.required&&(t.required=!0),l(t.loadCondition,!1)?r(t).catch(function(e){return t.backupUrl?(n("Main URL failed, attempting backup URL for "+t.id),i(t.onBackup),r(t,!0)):Promise.reject(e)}):(n("Condition failed. Will retry in one tick."),new Promise(function(i,o){var c=!0,a=setInterval(function(){l(t.loadCondition,!1)&&(n("Success with "+t.loadCondition),c=!1,r(t).then(function(){i()},function(e){o(e)}),clearInterval(a))},e.tickLength);setTimeout(function(){c&&(n("Timeout with "+t.loadCondition),o("Timeout"),clearInterval(a))},e.timeout)}))}),f=o(e.styles,function(t){return!1!==t.required&&(t.required=!0),"function"==typeof t.skipCondition&&l(t.skipCondition,!1)?(n("Skip condition met, skipping "+t.id),Promise.resolve()):l(t.loadCondition,!1)?c(t).catch(function(){return t.backupUrl?(n("Main URL failed, attempting backup URL for "+t.id),i(t.onBackup),c(t,!0)):Promise.reject(err)}):(n("Condition failed. Will retry in one tick."),new Promise(function(i,o){var r=!0,a=setInterval(function(){l(t.loadCondition,!1)&&(n("Success with "+t.loadCondition),r=!1,c(t).then(function(){i()},function(e){o(e)}),clearInterval(a))},e.tickLength);setTimeout(function(){r&&(n("Timeout with "+t.loadCondition),o("Timeout"),clearInterval(a))},e.timeout)}))});if(e.localStyle){var h=document.createElement("style");h.type="text/css",h.id=e.localStyleId,d.push(e.localStyleId);var p=e.localStyle;h.styleSheet?h.styleSheet.cssText=p:h.appendChild(document.createTextNode(p)),n("Adding local style"),document.getElementsByTagName("head")[0].appendChild(h)}return Promise.all([m,f]).then(function(){n("All tags accounted for, on to the main code.");var o=function(e,t){return function(n){return new Promise(function(o,r){e.forEach(function(e){var t=document.getElementById(e);t.parentNode.removeChild(t)}),t&&console.log("Deleted Marklet Elements."),i(n),o()})}}(d,e.logging);return l(e.codeRunCondition,!0).then(function(){return new Promise(function(e,i){clearInterval(s),n("Running main code."),"function"==typeof t&&t(o),e(o)})},function(){return new Promise(function(i,r){n("Condition failed. Will retry in one tick.");var c=setInterval(function(){l(e.codeRunCondition,!0).then(function(){n("Success with "+e.codeRunCondition),clearInterval(c),clearInterval(s),n("Running main code."),"function"==typeof t&&t(o),i(o)},function(){})},e.tickLength)})})}).catch(function(t){return clearInterval(s),console.error(t),d.forEach(function(e){var t=document.getElementById(e);t.parentNode.removeChild(t)}),n("Deleted Marklet Elements."),u=!0,i(e.onAbort,t),Promise.reject(t)})}
 })();