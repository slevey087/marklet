# Marklet

Helper framework for bookmarklets that load external scripts and/or stylesheets. Loading external scripts that depend on each other can be tricky if the scripts must execute in a specific order. A good example of this (which motivated me to create this tool) would be trying to use jQuery and jQuery plugins, as jQuery must be loaded before the plugins. Marklet can help.

## Installation

If you don't have NPM, you can open marklet_template_callback.js or marklet_template_promise.js using Github. Or you can use NPM to do a local install and open those files, with:
```
npm install marklet
```

If you'd like to use the command line tool to build your scripts for you, do a global install:
```
npm install marklet -g
```

## Usage

Wrap your bookmarklet code into the `marklet` function, using either a callback or a promise. 

```javascript
javascript:(function(){
	
	var options = { /* Define marklet options here */ };
	var codeToRun = function(deleter){
	    /* Your main bookmarklet code here */
	};
	
	marklet(options, codeToRun);
	
	/* The marklet source code goes here */
})();
	
```
or
```javascript
javascript:(function(){
	var options = { /* Define marklet options here */ };
	
	marklet(options).then(function(deleter){
		/* Your main bookmarklet code here */
	}).catch(function(){
		/* Error handling here */
	});
	
	/* The marklet source code goes here */
})();
```

(Note that if you use both a callback and a promise, the callback will execute first.) 

The scripts and styles to be included are defined in the options as _include trees_, explained below.

`deleter()` is a function supplied to your code by Marklet. When it is called, all tags added by Marklet will be deleted. This will return the page close to its previous state (though it will not remove any global variables added by the included scripts or your code). This is optional, but good practice.

## Build

To build your bookmarklet using Marklet, there are two options: copy/paste, or use the command-line tool. If you are using a local NPM install of Marklet or downloading direct from Github, use the copy/paste method. If you are using a global NPM install, use the command line interface.

### Copy/Paste

Open up either the file marklet_template_callback.js or marklet_template_promise.js, and replace your code as directed by the comments. Your final bookmarklet should follow one of the two formats above.


### Command Line Tool

Or, if you have NPM installed and Marklet installed globally, then you can use the command line interface. 

First ensure that your code is compatible with the format above. Marklet will take care of the wrapping, but it is your job to set Marklet options and call the `marklet` function. Ex:

```javascript
var options = { /* Define marklet options here */ };
var codeToRun = function(deleter){
    /* Your main bookmarklet code here */
};
    
marklet(options, codeToRun);
```

The CLI has the following format:

```
$ marklet <source file> [destination file]
```

`<source file>` must be the file name of the your code. `[destination file]` can be the desired output file name. `[destination file]` is optional, and if it is omitted, Marklet will create a file with the name `<source file>_marklet.js` in the same directory. The file created will be a minified file, which includes the `javascript:(function(){})();` bookmarklet wrapper.

## Include Trees

Each include entry should include at minimum a URL and an ID. This ID will become the ID for the `<script>` or `<link>` tags.

```javascript
var options = {};

options.scripts = {
	url:"//a/url/here.js",
	id:"myScript"
};

options.styles = {
	url:"//another/url/here.css",
	id:"myStyle"
};
```

Chain entries together in arrays to load non-dependent includes in any order:

```javascript
options.scripts = [
	{
		url:"//url/one.js",
		id:"scriptOne"
	},
	{
		url:"//url/alpha.js",
		id:"scriptAlpha"
	}
];
```

To force an include to wait until a previous include has finished, branch off using a `then` key:

```javascript
options.scripts = {
	url:"//url/one.js",
	id:"scriptOne",
	then:{
		url:"//url/two.js",
		id:"scriptTwo"
	}
};
```

You can also use arrays in branches, to indicate parallel dependent branches:

```javascript
options.scripts = {
	url:"//url/one.js",
	id:"scriptOne",
	then:[
		{
			url:"//url/two.js",
			id:"scriptTwo"
		},
		{
			url:"//url/beta.js",
			id:"scriptBeta"
		}
	]
};
```

Mix and match the above until you create the loading sequence that you want!

## Fallbacks

Marklet provides fallback options in case a resource fails to load. 

Use `backupUrl` to specify an alternate URL to try.

```javascript
options.styles = {
	url:"//url/one.js",
	backupUrl:"//url/oneBackup.js",
	id:"scriptOne",
	then:{
		url:"//url/two.js",
		id:"scriptTwo"
	}
}
;
```

Suppose that in the event both of these fail that you'd like to load an entirely different script tree. Use `catch`.

In the example below, Marklet will first try to load one.js, or if that fails it will try oneBackup.js. If either of those succeed, it will proceed down the `then` branch to load the dependent two.js. But if both of those were to fail, then Marklet would proceed down the `catch` branch instead, trying alpha.js then beta.js.

```javascript
options.scripts = {
	url:"//url/one.js",
	backupUrl:"//url/oneBackup.js",
	id:"scriptOne",
	then:{
		url:"//url/two.js",
		id:"scriptTwo"
	},
	catch:{
		url:"//url/alpha.js",
		id:"scriptAlpha"
		then:{
			url:"//url/beta.js",
			id:"scriptBeta"
		}
	}
}
;
```

In the event that a branch fails, Marklet will be aborted, and error handlers will run instead of the main bookmarklet code. However, you can prevent this by setting `required` to __false__. In the example below, should two.js fail to load properly, three.js would not be loaded but Marklet would still execute the main bookmarklet code.

```javascript
options.scripts = {
	url:"//url/one.js",
	id:"scriptOne",
	then:{
		url:"//url/two.js",
		id:"scriptTwo",
		required:false,
		then: {
			url:"//url/three.js",
			id:"scriptThree"
		}
	}
}
;
```

(Note also that `required` applies to an include _and_ its branches. In the above example, if two.js were to load but three.js were to fail, Marklet would still execute the main code.)

## Conditions

You can supply test conditions in several places to shape the behavior of Marklet. 

### loadCondition

If you would like an include to wait for a certain condition, provide a `loadCondition` function. 
This should be a function that returns __true__ if it is safe to load an include. If the function doesn't return __true__, then Marklet will wait one `tick` then test the condition again. You 
can define a `tick` length in `options`, but the default is 100 ms. You can also specify a `timeout`. If the test has not returned __true__ before the timeout, then the include will fail.

```javascript
options.scripts = {
	url:"//url/one.js",
	id:"scriptOne",
	loadCondition: function(){
		if (/* test */) return true;
	}
};
```

### skipCondition

To programmatically skip some include branches, add a `skipCondition`. Suuply a function that will return ``__true__ if the include branch should be skipped. Note that this will skip not just the
specific include, but also its `then` branch.

```javascript
options.scripts = {
	url:"//url/one.js",
	id:"scriptOne",
	skipCondition: function(){
		if (/* test */) return true;
	}
};
```

### codeRunCondition

This is a global option, a condition that is tested before the main code is allowed to run. Pass in a function that will return __true__ when it is safe for the main bookmarklet code to execute. If the function doesn't return __true__, then Marklet will try the test again in one tick, until the timeout is reached, at which point it will abort.

```javascript
options.codeRunCondition = function(){
	if (/* test */) return true;
};
```

## Events

Marklet provides both global and include-level events.

### onFetch

This is triggered when the tag is added to the DOM and the browser starts to fetch the resource.

```javascript
options.stlyles = {
	url:"//url/one.css",
	id:"styleOne",
	onFetch: function(){
		/* Do something */
	}
};
```

### onLoad

This is triggered when an include loads succesfully. Note that it applies to a specific include, rather than the whole branch.

```javascript
options.scripts = {
	url:"//url/one.js",
	id:"scriptOne",
	onLoad: function(){
		/* Do something */
	}
};
```

### onError

This will be triggered if attempts to load a resource trigger an `error` event from the browser. 

```javascript
options.scripts = {
	url:"//url/one.js",
	id:"scriptOne",
	onError: function(err){
		/* Do something */
	}
};
```

### onTimeout

This will be triggered if the browser has not given either a `load` or `error` event by the timeout (as defined in `options.timeout`). 

```javascript
options.styles = {
	url:"//url/one.css",
	id:"styleOne",
	onTimeout: function(err){
		/* Do something */
	}
};
```

### onBackup

This will be triggered if the primary URL fails, and Marklet is moving on to a backup URL. (This could come in handy if your backup is a different version of the same script).

```javascript
options.styles = {
	url:"//url/one.css",
	id:"styleOne",
	onBackup: function(err){
		/* Do something */
	}
};
```

### onFail

This is triggered if both the primary and backup URL fail to load (either timeout or error). Marklet will run your callback, then proceed down the `catch` branch, if there is one.

```javascript
options.scripts = {
	url:"//url/one.js",
	id:"scriptOne",
	onFail: function(err){
		/* Do something */
	}
};
```

### onAbort

This is a global callback, that will only run if Marklet aborts. (It is roughly equivalent to `marklet().catch()`)

```javascript
options.onAbort = function(err){
	/* Deal with whatever went horribly wrong */
};
```

## Local Style

In addition to fetching stylesheets using a URL, Marklet allows you to add CSS text directly. Supply the desired style rules as a string to `options.localStyle`, and Marklet will create and append a `<style>` tag in the `<head>` of the page. 

```javascript
options.localStyle = "div:{ max-height:1px; min-width:8000px; }";
```

## Global Options

The global options and their defaults are listed below:

```javascript
var options = {
	tickLength:100  				/* tick time in ms */
	timeout:10000   				/* timeout in ms */
	localStyle:""   				/* Local CSS style rules to add */
	localStyleId:"markletLocalCss"	/* ID for local style tag */
	logging:false					/* Put true for verbose logging */
	rejectIdConflict:true			/* If true, Marklet won't create a tag if the given ID is already present */
	codeRunCondition:null			/* Condition to test before running main code */
	onAbort:function(err){}			/* error event */
};
```
* _tickLength_ - if the __loadCondition__ on an include fails, Marklet will retry in one tick. Use this option to define a tick, in milliseconds. 
* _timeout_ - the number of milliseconds until Marklet stops trying to test the loadCondition on an include and aborts (or tries the `catch` branch, or skips the include if it's not required)
* _localStyle_ - pass Marklet local CSS text directly. (See "Local Style" above)
* _localStyleId_ - use this if you want to set a specific ID for the `<style>` tag Marklet creates for the _localStyle_.
* _logging_ - if __true__, Marklet will add verbose logs to the console as it works. Useful for debugging.
* _rejectIdConflict_ - if __true__, Marklet will fail if the ID of the tag it's trying to create is already being used in the document (or try the `catch` branch or skip un-required includes)
* _codeRunCondition_ - you can provide function that returns __true__ if it's safe to run the main bookmarklet code. See "Conditions" above.
* _onAbort_ - you can provide a function that is triggered instead of the main code if Marklet aborts. (It is not guaranteed to have an argument, but if the function is running then you know there was a problem)

## Example

Here is the test example (_test.js_ in the `example` folder). This is the code as it appears before using the command line tool. (Notice it uses both callback and promises). 

```javascript
var options= {
	scripts:[
		{
            url:"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js",
			backupUrl:"https://code.jquery.com/jquery-3.2.1.min.js",
            id:"jquery",
			onFetch:function(){console.log("jquery on Fetch handler!");},
			onLoad:function(){console.log("jquery on load handler!");},
			onError:function(){console.log("jquery on error handler!");},
			onTimeout:function(){console.log("jquery on timeout handler!");},
			onFail:function(){console.log("jquery on fail handler!");},
			then:[
				{
					url:"//cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.2.3/jquery-confirm.min.js",
					id:"jquery-alert",
					loadCondition:function(){if (typeof $ !== 'undefined') return true;}
				},
				{
					url:"//cdnjs.cloudflare.com/ajax/libs/Sortable/1.6.0/Sortable.min.js",
					id:"sortable"					
				}				
			],
			catch: {
				url:"https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js",
				id:"angular",				
				then:{
					url:"https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.6.0/Chart.js",
					id:"chartJS",
					then:{
						url:"https://cdnjs.cloudflare.com/ajax/libs/angular-chart.js/1.1.1/angular-chart.js",
						id:"angularChart"
					}
				}
			}
		}
	],		
    styles: [
		{
            url:"//cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.2.3/jquery-confirm.min.css",
            id:"alert-style",
			required:false,
		},	
		{	
			url:"//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css",
			id:"bootstrap",
			onFetch:function(){console.log("bootstrap on Fetch handler!");},
			onLoad:function(){console.log("bootstrap on load handler!");},
			onError:function(){console.log("bootstrap on error handler!");},
			onTimeout:function(){console.log("bootstrap on timeout handler!");},
			onFail:function(){console.log("bootstrap on fail handler!");}
		}
	],
	localStyle:"div:min-height:100px;",
    codeRunCondition: function(){if (typeof $.alert !== 'undefined') return true},
    logging: true,
    rejectIdConflict: false
};
	
/* the main code to run once the tags are added */
var codeToRun = function()  {
	console.log("I made it!");
};
	  
	
marklet(options, codeToRun)
	.then(function(deleterFunction){
		
		console.log("everything is dandy ");  
		
		setTimeout(function(){
			deleterFunction()
			.then(function(){
				console.log("Ran deleter function.");
			}); 
		},30000);
		
	})
	.catch(function(){alert("Oh no, Marklet aborted!");});
```

Then you could use the command line tool as follows:
```
$ marklet example/test.js 
```
And it will create the minified, marklet-ified _example/test_marklet.js_. Then open that file, copy and paste its contents into your URL bar.

## To-Do

* Add some flags to the CLI, to specify un-minified, or escaped code
