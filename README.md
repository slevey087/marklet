# Marklet

Helper framework for bookmarklets that load external scripts and/or stylesheets. Loading external scripts that depend on each other can be tricky if the scripts must
execute in a specific order. A good example of this (which motivated me to create this tool) would be trying to use jQuery and jQuery plugins, as jQuery must be
loaded before the plugins. Marklet can help.

## Installation

On NPM soon. 

## Usage

Wrap your bookmarklet code into the `marklet` function, using either a callback or a promise. 

```javascript
javascript:(function(){
	/* Define marklet options here */
	marklet(options, function(deleter){
		/* Your main bookmarklet code here */
	});
	/* The marklet source code goes here */
})();
	
```
or
```javascript
javascript:(function(){
	/* Define marklet options here */
	marklet(options).then(function(deleter){
		/* Your main bookmarklet code here */
	}).catch(function(){
		/* Error handling here */
	});
	/* The marklet source code goes here */
})();
```

The scripts and styles to be included are defined in the options, as resource trees, explained below.

`deleter()` is a function supplied to your code by Marklet. When it is called, all tags added by Marklet will be deleted. This will return the page close to its previous state (though it will not remove any global variables added by the included scripts or your code).

## Resource Trees

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

Chain entries together in arrays to source non-dependent scripts in any order:

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

Marklet provides fallback options in case there a script fails to load. 

Use `backupUrl` to specify an alternate URL to try.

```javascript
options.scripts = {
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

Suppose that both of these fail and that you'd like to load an entirely different script tree, use `catch`.
In the example below, Marklet will first try to load one.js, or if that fails it will try oneBackup.js. If either 
of those succeed, it will proceed down the `then` branch to load the dependent two.js. But if both of those were to
fail, then Marklet would proceed down the `catch` branch instead, trying alpha.js then beta.js.

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

In the event that a branch fails, Marklet will be aborted, and error handlers will run instead of the main 
bookmarklet code. However, you can prevent this by setting `require` to __false__. In the example below, 
should two.js fail to load properly, three.js would not be loaded but Marklet would still execute the main bookmarklet code.

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

(Note also that `required` applies to an entry _and_ its branches. In the above example, if two.js were to load but three.js were to fail, Marklet would still execute the main code.)

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
	loadCondition = function(){
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
	skipCondition = function(){
		if (/* test */) return true;
	}
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
	onError:function(){}			/* callback 
};
```