javascript:

    /* an array of urls and ids. Test code should be function that returns true
        if the script has loaded properly. */
    
    
    /* an array of urls and ids. Test code should be function that returns true
        if the script has loaded properly. */
    var options= {};
    options.scripts = 
        [{
            url:"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquer.min.js",
			backupUrl:"https://code.jquery.com/jquery-3.2.1.min.js",
            id:"jquery",						
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
		}];
    
    /* an array of styles to add */
    options.styles = {
            url:"//cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.2.3/jquery-confirm.min.css",
            id:"alert-style",
			required:false,
			then:[
				{
					url:"//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css",
					id:"bootstrap",
				}
			]
        };
	
	options.localStyle = "div:min-height:100px;";
    
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
		},25000);
		setTimeout(function(){console.clear();}, 30000)
	})
	.catch(function(){console.log("second error handler");});

    /* don't edit below this line! */
    function marklet(options, codeToRun) {
        "use strict";
		
		function log(string){
			options.logging ? console.log(string) : null;
		}
		
		options.timeout = options.timeout || 10000;		
		options.tickLength = options.tickLength || 100;
		if (typeof options.onError !== 'function') options.onError = function(){};
		options.localStyleId = options.localStyleId || "markletLocalCss";
		
		
		/* if (!Array.isArray(options.scriptsToAdd)) options.scriptsToAdd = [options.scriptsToAdd];
		if (!Array.isArray(options.stylesToAdd)) options.stylesToAdd = [options.stylesToAdd]; */
		
        var tagNumber = 1;
        
		
		function crawl(object, promiseFunction){
			/* Jump into entry if it's not an array */
			if (!Array.isArray(object)){
				
				/* If the skip conditon is true, then skip the whole branch */
				if (typeof object.skipCondition == 'function') {
					if (runTestCode(object.skipCondition, false)){
						log("Skip condition met, skipping " + object.id);
						return Promise.resolve();
					}
				}
				
				/* Run the function, then recurse */
				return promiseFunction(object).then(function(){
					if (object.hasOwnProperty("then")) return crawl(object.then, promiseFunction);
				}, function(err){
					/* We're here if the function failed. Try the alternate tree. */
					if (object.hasOwnProperty("catch")){
						log("Error with include: " + object.id + ". Attempting alternate branch.");
						return crawl(object.catch, promiseFunction).catch(function(err){
							/* If we're here, it's because the alternate tree failed too */
							if (object.required) return Promise.reject(err);
							else {
								log("Error with non-essential include: " + object.id + " and its alternates. Continuing.");
								return Promise.resolve();
							}
						});
					}
					/* No alternate tree but object is required */
					else if (object.required){
						return Promise.reject("Required include " + object.id + " encountered an error. Marklet aborted.");						
					}
					/* No alternate tree and object not required */
					else {
						log("Error with non-essential include: " + object.id + ". Continuing.");
						return Promise.resolve();
					}
				});	
			}
			/* If it is an array, Promise.all and recurse */
			else {
				
				return Promise.all(object.map(function(item){
					return crawl(item, promiseFunction);
				}));								
			}			
		}
		
        function addScript(script,id){
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
                    log("Fetching script: " + id);
					d.body.appendChild(s);
					var timer = setTimeout(function(){
						log("Timeout on script: " + id);
						s.parentNode.removeChild(s);
						reject();
						
					}, options.timeout);
					s.addEventListener("load", function(){
						log("Success with script: " + id);
						clearTimeout(timer);
						tagIds.push(id);
						resolve();
					});
					s.addEventListener("error", function(err){
						log("Error with script: " + id + ". Err: ");
						log(err);
						clearTimeout(timer);
						s.parentNode.removeChild(s);
						reject();
					});
					
                }
				else {
					log(id + " tag already present");
					if (options.rejectIdConflict) reject(id + " ID conflict rejected. Marklet aborted.");
					else resolve();
				}
				
            });
        }
		
        function addStyle (link,id){
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
					log("Fetching style: " + id);
                    document.getElementsByTagName("head")[0].appendChild(style);
					var timer = setTimeout(function(){
						log("Timeout on style: " + id);
						style.parentNode.removeChild(style);
						reject();
					}, options.timeout);
					
					style.addEventListener("load", function(){
						log("Success with style: " + id);
						clearTimeout(timer);
						tagIds.push(id);
						resolve();
					});
					
					style.addEventListener("error", function(err){
						log("Error with style: " + id + ". Err: "+ err);
						clearTimeout(timer);
						style.parentNode.removeChild(style);
						reject();
					});
					
                    
					
                }
				else {
					log(id + " tag already present");
					if (options.rejectIdConflict) reject(id + " ID conflict rejected. Marklet aborted.");
					else resolve();
				}
				
            });
        }
		
        function runTestCode(testCode, usePromise){
			if (typeof testCode !== 'function') {
				log("No condition given.");
				if (usePromise) return Promise.resolve();
				else return true;
			}
			
            log("Testing code " + testCode);
            if (usePromise) {
				return new Promise(function(resolve, reject){					
					if (testCode()) {
						log("Success with " + testCode);
						resolve();
					}
					else reject();
				});
			}
			else if (testCode()) {
				log("Success with " + testCode);
				return true;
			}
        }
        
        var tagIds = [];				
		
		
		/* Here's where the action starts! Start the clock */
		var ticker = setInterval(function(){
			log("Tick");
		}, options.tickLength);
			
		/* Create a promise that is a .all of all the script-loading promises */
		var scriptPromise = crawl(options.scripts, function(script){
			
			/* Validate script options here */
			if (!(script.required === false)) script.required = true;
			
			/* For each script to load, test the condition. */
			if (runTestCode(script.loadCondition, false)){
				/* If it returns true, add the script, which returns a promise */
				return addScript(script.url, script.id).catch(function(err){
					/* If main link fails, try the backup link. */
					if (script.backupUrl) {
						log("Main URL failed, attempting backup URL for " + script.id);
						return addScript(script.backupUrl, script.id);
					}
					else return Promise.reject(err);
				});
			}
			else {
				
				/* If the condition fails, set the timer to try in one tick */
				log("Condition failed. Will retry in one tick.");
				return new Promise(function(resolve, reject){					
					var timerRunning = true;
					
					var timer = setInterval(function(){						
						if (runTestCode(script.loadCondition, false)){
							log("Success with " + script.loadCondition);
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
							log("Timeout with " + script.loadCondition);
							reject("Timeout");
							clearInterval(timer);
							
						}
					}, options.timeout);
				}); 
			}
		});
			
		/* Create a promise that is a .all of all the style-loading promises */
		var stylePromise = crawl(options.styles, function(style){
			if (!(style.required === false)) style.required = true;
			
			if (typeof style.skipCondition == 'function') {
				if (runTestCode(style.skipCondition, false)){
					log("Skip condition met, skipping " + style.id);
					return Promise.resolve();
				}
			}
			
			/* For each script to load, test the condition. */
			if (runTestCode(style.loadCondition, false)){
			
				/* No conditions to test for, just return the promise once the style is added */
				return addStyle(style.url, style.id).catch(function(){
					/* If main url fails, try backup */
					if (style.backupUrl) {
						log("Main URL failed, attempting backup URL for " + style.id);
						return addStyle(style.backupUrl, style.id);
					}
					else return Promise.reject(err);
				});
			}
			else {					
				/* If the condition fails, set the timer to try in one tick */
				log("Condition failed. Will retry in one tick.");
				return new Promise(function(resolve, reject){					
					var timerRunning = true;
					
					var timer = setInterval(function(){						
						if (runTestCode(style.loadCondition, false)){
							log("Success with " + style.loadCondition);
							timerRunning = false;
							addScript(style.url, style.id).then(function(){
								resolve()
							}, function(err){
								reject(err);
							});							
							clearInterval(timer);
						}
					}, options.tickLength);
					
					
					var timeout = setTimeout(function(){
						if (timerRunning) {
							log("Timeout with " + style.loadCondition);
							reject("Timeout");
							clearInterval(timer);
							
						}
					}, options.timeout);
				});    
			}
		});
			
		/* Meanwhile, add local css rules */
		if (options.localStyle) {
			var css = document.createElement('style');
			css.type = 'text/css';
			css.id = options.localStyleId;
			
			/* To make sure this tag gets deleted in the deleter */
			tagIds.push(options.localStyleId);

			var styles = options.localStyle;

			if (css.styleSheet) css.styleSheet.cssText = styles;
			else css.appendChild(document.createTextNode(styles));

			log("Adding local style");
			document.getElementsByTagName("head")[0].appendChild(css);
		}
			
		/* .all is here so that ensuing code won't run until all the tags have been added and tested */
		return Promise.all([scriptPromise, stylePromise])
		.then(function(){
			log("All tags accounted for, on to the main code."); 
			
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
						log("Running main code.");
						if (typeof codeToRun == 'function') codeToRun(deleter);
						resolve(deleter);
				});			
			}, function(){
				/* If code condition not met, try again in one tick */
				return new Promise(function(resolve, reject){
					log("Condition failed. Will retry in one tick.");
					var timer = setInterval(function(){                    
						runTestCode(options.codeRunCondition, true).then(function(){
							/* When condition passes, clear ticker and run main code (returning the deleter) */
							log("Success with " + options.codeRunCondition);
							clearInterval(timer);
							clearInterval(ticker);
							log("Running main code.");
							if (typeof codeToRun == 'function') codeToRun(deleter);
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
			log("Deleted Marklet Elements.");
			
            options.onError(err);			
			return Promise.reject(err);
        });      
    }
    