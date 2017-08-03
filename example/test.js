var options= {};
    options.scripts = 
        [{
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
		}];
    
    /* an array of styles to add */
    options.styles = [
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
	];
	
	options.localStyle = "div:min-height:100px;";
    
    /* condition to verify before running main code */
    options.codeRunCondition = function(){if (typeof $.alert !== 'undefined') return true};
    
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