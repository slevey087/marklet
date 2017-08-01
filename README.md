# Marklet
---
Helper framework for bookmarklets that load external scripts and/or stylesheets. Loading external scripts that depend on each other can be tricky if the scripts must
execute in a specific order. A good example of this (which motivated me to create this tool) would be trying to use jQuery and jQuery plugins, as jQuery must be
loaded before the plugins. Marklet can help.

## Installation
---
On NPM soon. 

## Usage
---
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

The scripts and styles to be included are defined in the options, as resource trees.

### Resource Trees

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
}
;
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

