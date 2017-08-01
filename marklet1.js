javascript:

    /* an array of urls and ids. Test code should be function that returns true
        if the script has loaded properly. */
    
    
    /* an array of urls and ids. Test code should be function that returns true
        if the script has loaded properly. */
    var options= {};
    options.scriptsToAdd = 
        {
            url:"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js",
            id:"jquery",
			then:[
				{
					url:"//cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.2.3/jquery-confirm.min.js",
					id:"jquery-alert",
					testCode:function(){if (typeof $ !== 'undefined') return true;}
				},
				{
				url:"//cdnjs.cloudflare.com/ajax/libs/Sortable/1.6.0/Sortable.min.js",
				id:"sortable"            
				}				
			],
			
		};
    
    /* an array of styles to add */
    options.stylesToAdd = {
            url:"//cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.2.3/jquery-confirm.min.css",
            id:"alert-style"
        };

    
    /* condition to verify before running main code */
    /* options.codeRunCondition = function(){if (typeof $.alert !== 'undefined') return true}; */
    
    /* the main code to run once the tags are added */
    var codeToRun = function()  {
        console.log("I made it!");
    };
    options.logging = true;
    options.rejectIdConflict = false;
	
    marklet(options, codeToRun)
	.then(function(deleterFunction){
		console.log("everything is dandy ");  
		setTimeout(function(){
			deleterFunction()
			.then(function(){
				console.log("Finished deleter");
			}); 
		},5000);
	})
	.catch(function(){console.log("second error handler");});

    /* don't edit below this line! */
    function marklet(options, codeToRun) {
        "use strict";
		
		options.timeout = options.timeout || 10000;		
		options.abortOnTimeout === false ? null : options.abortOnTimeout = true;
		options.tickLength = options.tickLength || 100;
		if (typeof options.onError !== 'function') options.onError = function(){};
		
		
		if (!Array.isArray(options.scriptsToAdd)) options.scriptsToAdd = [options.scriptsToAdd];
		if (!Array.isArray(options.stylesToAdd)) options.stylesToAdd = [options.stylesToAdd];
		
        var tagNumber = 1;
        
		
		function crawl(object, promiseFunction){
			if (!Array.isArray(object)){
				return promiseFunction(object).then(function(){
					if (object.hasOwnProperty("then")) return crawl(object.then, promiseFunction);				
				});				
			}
			else {
				return Promise.all(object.map(function(item){
					return crawl(item, promiseFunction);
				}));								
			}			
		}
		
        function addScript(script,id, required){
            return new Promise(function(resolve, reject){
                if (!id) {
                    id = "marklet" + tagNumber.toString();
                    tagNumber++;
                }
                var d=document;
                if (!d.getElementById(id)){
                    var s=d.createElement("script");
                    s.src=script;
                    s.id=id;
                    options.logging ? console.log("Fetching script: " + id) : null;	
					d.body.appendChild(s);
					var timer = setTimeout(function(){
						options.logging ? console.log("Timeout on script: " + id) : null;
						if (required) reject("Required script " + id + " encountered an error. Marklet aborted.");
						else {
							options.logging ? console.log("Error with non-essential script: " + id + ". Continuing.") : null;
							resolve();
						}
					}, options.timeout);
					s.addEventListener("load", function(){
						options.logging ? console.log("Success with script: " + id) : null;
						clearTimeout(timer);
						resolve();
					});
					s.addEventListener("error", function(err){
						options.logging ? console.log("Error with script: " + id + ". Err: "+ err) : null;
						clearTimeout(timer);
						if (required) reject("Required script " + id + " encountered an error. Marklet aborted.");
						else {
							options.logging ? console.log("Error with non-essential script: " + id + ". Continuing.") : null;
							resolve();
						}
					});
					tagIds.push(id);                    				
                }
				else {
					options.logging ? console.log(id + " tag already present") : null;
					if (options.rejectIdConflict) reject(id + " ID conflict rejected. Marklet aborted.");
					else resolve();
				}
				
            });
        }
		
        function addStyle (link,id, required){
            return new Promise(function(resolve, reject){
                if (!id) {
                    id = "marklet" + tagNumber.toString();
                    tagNumber++;
                }
                if (!document.getElementById(id)){
                    var style = document.createElement("link");
                    style.id = id;
                    style.rel = "stylesheet";
                    style.type = "text/css";
                    style.href = link;
					options.logging ? console.log("Fetching style: " + id) : null;
                    document.getElementsByTagName("head")[0].appendChild(style);
					var timer = setTimeout(function(){
						options.logging ? console.log("Timeout on style: " + id) : null;
						if (required) reject("Required style " + id + " encountered an error. Marklet aborted.");
						else {
							options.logging ? console.log("Error with non-essential style: " + id + ". Continuing.") : null;
							resolve();
						}
					}, options.timeout);
					style.addEventListener("load", function(){
						options.logging ? console.log("Success with style: " + id) : null;
						clearTimeout(timer);
						resolve();
					});
					style.addEventListener("error", function(err){
						options.logging ? console.log("Error with style: " + id + ". Err: "+ err) : null;
						clearTimeout(timer);
						if (required) reject("Required style " + id + " encountered an error. Marklet aborted.");
						else {
							options.logging ? console.log("Error with non-essential style: " + id + ". Continuing.") : null;
							resolve();
						}
					});
					tagIds.push(id);
                    
					
                }
				else {
					options.logging ? console.log(id + " tag already present") : null;
					if (options.rejectIdConflict) reject(id + " ID conflict rejected. Marklet aborted.");
					else resolve();
				}
				
            });
        }
		
        function runTestCode(testCode, usePromise){
			if (typeof testCode !== 'function') {
				options.logging ? console.log("No condition given.") : null;
				if (usePromise) return Promise.resolve();
				else return true;
			}
			
            options.logging ? console.log("Testing code " + testCode) : null;			
            if (usePromise) {
				return new Promise(function(resolve, reject){					
					if (testCode()) {
						options.logging ? console.log("Success with " + testCode) : null;
						resolve();
					}
					else reject();
				});
			}
			else if (testCode()) {
				options.logging ? console.log("Success with " + testCode) : null;
				return true;
			}
        }
        
        var tagIds = [];				
		
		
		/* Here's where the action starts! Start the clock */
		var ticker = setInterval(function(){
			options.logging ? console.log("Tick") : null;
		}, options.tickLength);
			
		/* Create a promise that is a .all of all the script-loading promises */
		var scriptPromise = crawl(options.scriptsToAdd, function(script){
			
			/* Validate script options here */
			if (!(script.required === false)) script.required = true;
			
			/* For each script to load, test the condition. */
			if (runTestCode(script.testCode, false)){
				/* If it returns true, add the script, which returns a promise */
				return addScript(script.url, script.id, script.required);
			}
			else {
				
				/* If the condition fails, set the timer to try in one tick */
				options.logging ? console.log("Condition failed. Will retry in one tick.") : null;
				return new Promise(function(resolve, reject){					
					var timerRunning = true;
					
					var timer = setInterval(function(){						
						if (runTestCode(script.testCode, false)){
							options.logging ? console.log("Success with " + script.testCode) : null;
							timerRunning = false;
							addScript(script.url, script.id).then(function(){
								resolve()
							}, function(err){
								reject(err);
							});							
							clearInterval(timer);
						}
					}, options.tickLength);
					
					
					var timeout = setTimeout(function(){
						if (timerRunning) {
							options.logging ? console.log("Timeout with " + script.testCode) : null;
							reject("Timeout");
							clearInterval(timer);
							
						}
					}, options.timeout);
				});    
			}
		});
			
		/* Create a promise that is a .all of all the style-loading promises */
		var stylePromise = crawl(options.stylesToAdd, function(style){
			if (!(style.required === false)) style.required = true;
			
			/* No conditions to test for, just return the promise once the style is added */
			return addStyle(style.url, style.id);
		});
			
		/* .all is here so that ensuing code won't run until all the tags have been added and tested */
		return Promise.all([scriptPromise, stylePromise])
		.then(function(){
			options.logging ? console.log("All tags accounted for, on to the main code.") : null; 
			
			/* This function generates a function that will delete all the tags added. */
			var deleter = (function(ids, logging){
				return function(callback){
					return new Promise(function(resolve, reject){
						ids.forEach(function(id){
							var el = document.getElementById(id);
							el.parentNode.removeChild(el);							
						});
						logging ? console.log("Deleted Marklet Elements.") : null;
						if (typeof callback == 'function') callback();
						resolve();
					});
				};
			})(tagIds, options.logging);
			
			/* Run the main test code. */
			return runTestCode(options.codeRunCondition, true).then(function(){
				/* If all goes well, stop ticker and run code (returning the deleter). */
				return new Promise(function(resolve, reject){
						clearInterval(ticker);
						options.logging ? console.log("Running main code.") : null;
						codeToRun(deleter);
						resolve(deleter);
				});			
			}, function(){
				/* If code condition not met, try again in one tick */
				return new Promise(function(resolve, reject){
					options.logging ? console.log("Condition failed. Will retry in one tick.") : null;
					var timer = setInterval(function(){                    
						runTestCode(options.codeRunCondition, true).then(function(){
							/* When condition passes, clear ticker and run main code (returning the deleter) */
							options.logging ? console.log("Success with " + options.codeRunCondition) : null;                       
							clearInterval(timer);
							clearInterval(ticker);
							options.logging ? console.log("Running main code.") : null;
							codeToRun(deleter);
							resolve(deleter);
						}, function(){/* testCode failed, try again */});
					}, options.tickLength);
				});    
			});
        }).catch(function(err){
			/* If There was some kind of attaching the scripts, run the callback, deleter, and re-broadcast the failed promise */
			clearInterval(ticker);			
			console.error(err);						
			
			/* short version of the deleter function, to remove tags just added */
			tagIds.forEach(function(id){
				var el = document.getElementById(id);
				el.parentNode.removeChild(el);							
			});
			options.logging ? console.log("Deleted Marklet Elements.") : null;
			
            options.onError(err);			
			return Promise.reject(err);
        });         
    }
    