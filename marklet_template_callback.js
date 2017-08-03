javascript:(function(){

/* Define Marklet Options and Includes */
var options = {};

var codeToRun = function(deleter){
/* Put Main Bookmarklet Code Here */
};

marklet(options, codeToRun);

/* Marklet Source Code Below, Do Not Edit */
function marklet(e,t){"use strict";function n(t){e.logging&&console.log(t)}function i(e){if("function"==typeof e)return e()}function o(e,t){return Array.isArray(e)?Promise.all(e.map(function(e){return o(e,t)})):"function"==typeof e.skipCondition&&l(e.skipCondition,!1)?(n("Skip condition met, skipping "+e.id),Promise.resolve()):t(e).then(function(){if(e.hasOwnProperty("then"))return o(e.then,t)},function(r){return i(e.onFail(r)),e.hasOwnProperty("catch")?(n("Error with include: "+e.id+". Attempting alternate branch."),o(e.catch,t).catch(function(t){return e.required?Promise.reject(t):(n("Error with non-essential include: "+e.id+" and its alternates. Continuing."),Promise.resolve())})):e.required?Promise.reject("Required include "+e.id+" encountered an error. Marklet aborted."):(n("Error with non-essential include: "+e.id+". Continuing."),Promise.resolve())})}function r(t,o){return new Promise(function(r,c){var l=t.id,d=o?t.backupUrl:t.url;l||(l="marklet"+a.toString(),a++);var s=document;if(s.getElementById(l))n(l+" tag already present"),e.rejectIdConflict?c(l+" ID conflict rejected. Marklet aborted."):r();else{var m=s.createElement("script");m.src=d,m.id=l,n("Fetching script: "+l),s.body.appendChild(m);var f=setTimeout(function(){n("Timeout on script: "+l),m.parentNode.removeChild(m),c(),i(t.onTimeout())},e.timeout);m.addEventListener("load",function(){n("Success with script: "+l),clearTimeout(f),u.push(l),r(),i(t.onLoad())}),m.addEventListener("error",function(e){n("Error with script: "+l+". Err: "),n(e),clearTimeout(f),m.parentNode.removeChild(m),c(e),i(t.onError(e))})}})}function c(t,o){return new Promise(function(r,c){var l=o?t.backupUrl:t.url,d=t.id;if(d||(d="marklet"+a.toString(),a++),document.getElementById(d))n(d+" tag already present"),e.rejectIdConflict?c(d+" ID conflict rejected. Marklet aborted."):r();else{var s=document.createElement("link");s.id=d,s.rel="stylesheet",s.type="text/css",s.href=l,n("Fetching style: "+d),document.getElementsByTagName("head")[0].appendChild(s);var m=setTimeout(function(){n("Timeout on style: "+d),s.parentNode.removeChild(s),c(),i(t.onTimeout())},e.timeout);s.addEventListener("load",function(){n("Success with style: "+d),clearTimeout(m),u.push(d),r(),i(t.onLoad())}),s.addEventListener("error",function(e){n("Error with style: "+d+". Err: "),n(e),clearTimeout(m),s.parentNode.removeChild(s),c(e),i(t.onError(e))})}})}function l(e,t){return"function"!=typeof e?(n("No condition given."),!t||Promise.resolve()):(n("Testing code "+e),t?new Promise(function(t,i){e()?(n("Success with "+e),t()):i()}):e()?(n("Success with "+e),!0):void 0)}e.timeout=e.timeout||1e4,e.tickLength=e.tickLength||100,e.localStyleId=e.localStyleId||"markletLocalCss";var a=1,u=[],d=setInterval(function(){n("Tick")},e.tickLength),s=o(e.scripts,function(t){return!1!==t.required&&(t.required=!0),l(t.loadCondition,!1)?r(t).catch(function(e){return t.backupUrl?(n("Main URL failed, attempting backup URL for "+t.id),i(t.onBackup()),r(t,!0)):Promise.reject(e)}):(n("Condition failed. Will retry in one tick."),new Promise(function(i,o){var c=!0,a=setInterval(function(){l(t.loadCondition,!1)&&(n("Success with "+t.loadCondition),c=!1,r(t).then(function(){i()},function(e){o(e)}),clearInterval(a))},e.tickLength);setTimeout(function(){c&&(n("Timeout with "+t.loadCondition),o("Timeout"),clearInterval(a))},e.timeout)}))}),m=o(e.styles,function(t){return!1!==t.required&&(t.required=!0),"function"==typeof t.skipCondition&&l(t.skipCondition,!1)?(n("Skip condition met, skipping "+t.id),Promise.resolve()):l(t.loadCondition,!1)?c(t).catch(function(){return t.backupUrl?(n("Main URL failed, attempting backup URL for "+t.id),c(t,!0)):Promise.reject(err)}):(n("Condition failed. Will retry in one tick."),new Promise(function(i,o){var r=!0,a=setInterval(function(){l(t.loadCondition,!1)&&(n("Success with "+t.loadCondition),r=!1,c(t).then(function(){i()},function(e){o(e)}),clearInterval(a))},e.tickLength);setTimeout(function(){r&&(n("Timeout with "+t.loadCondition),o("Timeout"),clearInterval(a))},e.timeout)}))});if(e.localStyle){var f=document.createElement("style");f.type="text/css",f.id=e.localStyleId,u.push(e.localStyleId);var h=e.localStyle;f.styleSheet?f.styleSheet.cssText=h:f.appendChild(document.createTextNode(h)),n("Adding local style"),document.getElementsByTagName("head")[0].appendChild(f)}return Promise.all([s,m]).then(function(){n("All tags accounted for, on to the main code.");var o=function(e,t){return function(n){return new Promise(function(o,r){e.forEach(function(e){var t=document.getElementById(e);t.parentNode.removeChild(t)}),t&&console.log("Deleted Marklet Elements."),i(n()),o()})}}(u,e.logging);return l(e.codeRunCondition,!0).then(function(){return new Promise(function(e,i){clearInterval(d),n("Running main code."),"function"==typeof t&&t(o),e(o)})},function(){return new Promise(function(i,r){n("Condition failed. Will retry in one tick.");var c=setInterval(function(){l(e.codeRunCondition,!0).then(function(){n("Success with "+e.codeRunCondition),clearInterval(c),clearInterval(d),n("Running main code."),"function"==typeof t&&t(o),i(o)},function(){})},e.tickLength)})})}).catch(function(t){return clearInterval(d),console.error(t),u.forEach(function(e){var t=document.getElementById(e);t.parentNode.removeChild(t)}),n("Deleted Marklet Elements."),i(e.onError(t)),Promise.reject(t)})}
 })();