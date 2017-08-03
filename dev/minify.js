var fs = require('fs')
var UglifyJS = require("uglify-js");

var sourcePath = __dirname + "/../src/marklet.js";
var outPath = __dirname + "/../dist/marklet.min.js";

console.log("Minifying...");

fs.readFile(sourcePath, {encoding:"utf8"}, (err,data)=>{
	if (err) {
		console.error("File error.")
		console.error(err);
		console.error("Quitting. Goodbye.")
	}
	
	else {
		console.log("File read, minifying.");
		var result = UglifyJS.minify(data);
		
		if (result.error) {
			console.error(result.error);
			process.exit(1);
		}
		else {
			fs.writeFile(outPath, result.code, (err) =>{
				if (err) {
					console.error("Error reading Marklet code.")
					console.error(err);
					console.error("Quitting. Goodbye.")
					process.exit(1);
				}
				else {
					console.log("File write successful!!");
				}
			});					
		}				
	}
});
