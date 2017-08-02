# Marklet

Helper framework for bookmarklets that load external scripts and/or stylesheets. Loading external scripts that depend on each other can be tricky if the scripts must execute in a specific order. A good example of this (which motivated me to create this tool) would be trying to use jQuery and jQuery plugins, as jQuery must be loaded before the plugins. Marklet can help.

## Installation

On NPM soon. 

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

The scripts and styles to be included are defined in the options as _include trees_, explained below.

`deleter()` is a function supplied to your code by Marklet. When it is called, all tags added by Marklet will be deleted. This will return the page close to its previous state (though it will not remove any global variables added by the included scripts or your code). This is optional, but good practice.

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

In the event that a branch fails, Marklet will be aborted, and error handlers will run instead of the main bookmarklet code. However, you can prevent this by setting `require` to __false__. In the example below, should two.js fail to load properly, three.js would not be loaded but Marklet would still execute the main bookmarklet code.

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

## Callbacks

Marklet provides both global and include-level callbacks.

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

### onError (include)

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

### onError (global)

This is a global callback, that will only run if Marklet aborts. (It is roughly equivalent to `marklet().catch()`)

```javascript
options.onError = function(err){
	/* Deal with whatever went horribly wrong */
};
```



## Global Options

The global options and their defaults are listed below:

```javascript
var options = {
	tickLength:100  				/* tick time in ms */
	timeout:10000   				/* timeout in ms */
	localStyle:""   				/* Local CSS style rules to add */
	localStyleId:"markletLocalCss"	/* ID for local style tag */
	rejectIdConflict:true			/* If true, Marklet won't create a tag if the given ID is already present */
	logging:false					/* Put true for verbose logging */
	codeRunCondition:null			/* Condition to test before running main code */
	onError:function(){}			/* callback */
};
```


## Build

To build your bookmarklet using Marklet, there are two options: copy/paste, or use the command-line tool.

### Copy/Paste

Open up either the file marklet_template_callback.js or marklet_template_promise.js, and replace your code as directed by the comments. As per above, your final bookmarklet should follow this format:

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