javascript:

    /* an array of urls and ids. Test code should be function that returns true
        if the script has loaded properly. */
    
    
    /* an array of urls and ids. Test code should be function that returns true
        if the script has loaded properly. */
    var options= {};
    options.scriptsToAdd = [
        {
            url:"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js",
            id:"jquery",
            testCode:function(){return true;}
        },
        {
            url:"//cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.2.3/jquery-confirm.min.js",
            id:"jquery-alert",
            testCode:function(){if (typeof $ !== 'undefined') return true;}
        },
        {
            url:"//cdnjs.cloudflare.com/ajax/libs/Sortable/1.6.0/Sortable.min.js",
            id:"sortable",
            testCode:function(){return true;}
        }
    ];
    
    /* an array of styles to add */
    options.stylesToAdd = [
        {
            url:"//cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.2.3/jquery-confirm.min.css",
            id:"alert-style"
        }
    ];

    
    /* condition to verify before running main code */
    options.codeRunCondition = function(){if (typeof $.alert !== 'undefined') return true};
    
    /* the main code to run once the tags are added */
    var codeToRun = function()  {
        console.log("I made it!");
    };
    options.logging = true;
    options.rejectIdConflict = true;
	
    marklet(options, codeToRun)
	.then(function(){console.log("everything is dandy");})
	.catch(function(){console.log("second error handler");});

    /* don't edit below this line! */
    function marklet(options, codeToRun) {
        
		options.tickLength = options.tickLength || 100;		
		if (typeof options.onError !== 'function') options.onError = function(){};
		
        var tagNumber = 1;
        
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
                    d.body.appendChild(s);
                    options.logging ? console.log("Added script: " + id) : null;
					resolve();
                }
				else {
					options.logging ? console.log(id + " tag already present") : null;
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
                    var styles = document.createElement("link");
                    styles.id = id;
                    styles.rel = "stylesheet";
                    styles.type = "text/css";
                    styles.href = link;
                    document.getElementsByTagName("head")[0].appendChild(styles);
                    options.logging ? console.log("Added style: " + id) : null;
					resolve();
                }
				else {
					options.logging ? console.log(id + " tag already present") : null;
					if (options.rejectIdConflict) reject(id + " ID conflict rejected. Marklet aborted.");
					else resolve();
				}
            });
        }
        function runTestCode(testCode, usePromise){
            options.logging ? console.log("Testing code " + testCode) : null;			
            if (usePromise) {
				return new Promise(function(resolve, reject){
					if (testCode()) resolve();
					else reject();
				});
			}
			else if (testCode()) return true;
        }
        
        var tagIds = [];
		
		
		
		/* Here's where the action starts! Start the clock */
		var ticker = setInterval(function(){
			options.logging ? console.log("Tick") : null;
		}, options.tickLength);
			
		/* Create a promise that is a .all of all the script-loading promises */
		var scriptPromise = Promise.all(options.scriptsToAdd.map(function(script){
			/* For each script to load, test the condition. */
			if (runTestCode(script.testCode, false)){
				/* If it returns true, add the script, which returns a promise */
				options.logging ? console.log("Success with " + script.testCode) : null;
				return addScript(script.url, script.id);
			}
			else {
				/* If the condition fails, set the timer to try in one tick */
				options.logging ? console.log("Condition failed. Will retry in one tick.") : null;
				return new Promise(function(resolve, reject){
					var timer = setInterval(function(){						
						if (runTestCode(script.testCode, false)){
							options.logging ? console.log("Success with " + script.testCode) : null;                            
							addScript(script.url, script.id);                            
							resolve();
							clearInterval(timer);
						}
					}, options.tickLength);
				});    
			}
		}));
			
		/* Create a promise that is a .all of all the style-loading promises */
		var stylePromise = Promise.all(options.stylesToAdd.map(function(style){
			/* No conditions to test for, just return the promise once the style is added */
			return addStyle(style.url, style.id);
		}));
			
		/* .all is here so that ensuing code won't run until all the tags have been added and tested */
		return Promise.all([scriptPromise, stylePromise])
		.then(function(){
			options.logging ? console.log("All tags accounted for, on to the main code.") : null;                            
            return runTestCode(options.codeRunCondition, true).then(function(){
				return new Promise(function(resolve, reject){
						clearInterval(ticker);
						options.logging ? console.log("Running main code.") : null;
						codeToRun();
						resolve();
				});			
			}, function(){
				return new Promise(function(resolve, reject){
					options.logging ? console.log("Condition failed. Will retry in one tick.") : null;
					var timer = setInterval(function(){                    
						runTestCode(options.codeRunCondition, true).then(function(){
							options.logging ? console.log("Success with " + options.codeRunCondition) : null;                       
							clearInterval(timer);
							clearInterval(ticker);
							options.logging ? console.log("Running main code.") : null;
							codeToRun();
						}, function(){/* testCode failed, try again */});
					}, options.tickLength);
				});    
			});
        }).catch(function(err){
			clearInterval(ticker);
            options.onError(err);
			console.error(err);
			return Promise.reject(err);
        });         
    }
    