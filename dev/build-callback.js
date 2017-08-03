var fs = require('fs');

var sourcePath = __dirname + "/../dist/marklet.min.js";
var outPath = __dirname + "/../marklet_template_callback.js";

var code = "javascript:(function(){\n\n";
code += "/* Define Marklet Options and Includes */\n";
code += "var options = {};\n\n";
code += "var codeToRun = function(deleter){\n";
code += "/* Put Main Bookmarklet Code Here */\n";
code += "};\n\n";
code += "marklet(options, codeToRun);\n\n";
code += "/* Marklet Source Code Below, Do Not Edit */\n";

console.log("Building Callback Template...");

fs.readFile(sourcePath, (err, data)=>{
	if (err) {
		console.error("Read Error: ");
		console.error(err);
		process.exit(1);
	}
	else {
		code += data;
		code += "\n })();";
		
		fs.writeFile(outPath, code, (err)=>{
			if (err) {
				console.error("Write Error: ");
				console.error(err);
				process.exit(1);
			}
			else console.log("Success!")
		});
	}
});