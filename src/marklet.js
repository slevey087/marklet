
    /* don't edit below this line! */
    function marklet(options, codeToRun) {
        "use strict";			
		
		function log(string){
			(options.logging && !aborted) ? console.log(string) : null;
		}
		
		function backCall(callback, arg1){
			if (typeof callback === 'function' && !aborted) return callback(arg1);
		}
		
		options.timeout = options.timeout || 10000;		
		options.tickLength = options.tickLength || 100;
		options.localStyleId = options.localStyleId || "markletLocalCss";
		
		
		/* if (!Array.isArray(options.scriptsToAdd)) options.scriptsToAdd = [options.scriptsToAdd];
		if (!Array.isArray(options.stylesToAdd)) options.stylesToAdd = [options.stylesToAdd]; */
		
        var tagNumber = 1;
        var aborted = false;
		
		function crawl(object, promiseFunction){
			if (aborted) return Promise.reject();
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
					/* We're here if the function failed. Run callback */
					backCall(object.onFail, err);
					
					/* Try the alternate tree. */
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
		
        function addScript(script, backup){
			if (aborted) return Promise.reject();
            return new Promise(function(resolve, reject){
                var id = script.id;
				var url = backup ? script.backupUrl : script.url;
				
				if (!id) {
                    id = "marklet" + tagNumber.toString();
                    tagNumber++;
                }
                var d=document;
                if (!d.getElementById(id)){
                    var s=d.createElement("script");
                    s.src=url;
                    s.id=id;
                    log("Fetching script: " + id);					
					d.body.appendChild(s);
					backCall(script.onFetch);
					var timer = setTimeout(function(){
						log("Timeout on script: " + id);
						s.parentNode.removeChild(s);						
						reject();
						backCall(script.onTimeout);
					}, options.timeout);
					s.addEventListener("load", function(){
						log("Success with script: " + id);
						clearTimeout(timer);
						tagIds.push(id);
						resolve();
						backCall(script.onLoad);
					});
					s.addEventListener("error", function(err){
						log("Error with script: " + id + ". Err: ");
						log(err);
						clearTimeout(timer);
						s.parentNode.removeChild(s);
						reject(err);
						backCall(script.onError, err);	
					});
					
                }
				else {
					log(id + " tag already present");
					if (options.rejectIdConflict) reject(id + " ID conflict rejected. Marklet aborted.");
					else resolve();
				}
				
            });
        }
		
        function addStyle (style, backup){
			if (aborted) return Promise.reject();
            return new Promise(function(resolve, reject){
				
                var url = backup ? style.backupUrl : style.url;
				var id = style.id;
				
				if (!id) {
                    id = "marklet" + tagNumber.toString();
                    tagNumber++;
                }
                if (!document.getElementById(id)){
                    var tag = document.createElement("link");
                    tag.id = id;
                    tag.rel = "stylesheet";
                    tag.type = "text/css";
                    tag.href = url;
					log("Fetching style: " + id);					
                    document.getElementsByTagName("head")[0].appendChild(tag);
					backCall(style.onFetch);
					var timer = setTimeout(function(){
						log("Timeout on style: " + id);
						tag.parentNode.removeChild(tag);
						reject();
						backCall(style.onTimeout);
					}, options.timeout);
					
					tag.addEventListener("load", function(){
						log("Success with style: " + id);
						clearTimeout(timer);
						tagIds.push(id);
						resolve();
						backCall(style.onLoad);
					});
					
					tag.addEventListener("error", function(err){
						log("Error with style: " + id + ". Err: ");
						log(err);
						clearTimeout(timer);
						tag.parentNode.removeChild(tag);
						reject(err);
						backCall(style.onError, err);						
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
			
			/* TODO Validate script options here */
			if (!(script.required === false)) script.required = true;
			
			/* For each script to load, test the condition. */
			if (runTestCode(script.loadCondition, false)){
				/* If it returns true, add the script, which returns a promise */
				return addScript(script).catch(function(err){
					/* If main link fails, try the backup link. */
					if (script.backupUrl) {
						log("Main URL failed, attempting backup URL for " + script.id);
						backCall(script.onBackup);
						return addScript(script, true);
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
							addScript(script).then(function(){
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
			
			/* For each style to load, test the condition. */
			if (runTestCode(style.loadCondition, false)){
			
				/* No conditions to test for, just return the promise once the style is added */
				return addStyle(style).catch(function(){
					/* If main url fails, try backup */
					if (style.backupUrl) {
						log("Main URL failed, attempting backup URL for " + style.id);
						backCall(style.onBackup);
						return addStyle(style, true);
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
							addStyle(style).then(function(){
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
						backCall(callback);
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
			aborted = true;
            if (typeof options.onAbort === 'function') options.onAbort(err);
			return Promise.reject(err);
        });      
    };
    