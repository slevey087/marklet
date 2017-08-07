#!/usr/bin/env node

"use strict";

var fs = require('fs')
var program = require('commander');
var UglifyJS = require("uglify-js");

var markletPath =  __dirname + "/../dist/marklet.min.js";
var inputFile;
var outputFile;

program
	.version('0.0.1')
	.arguments('<inputFileName> [outputFileName]')
	.option('-b, --bigly', "Don't minify code.")
	.option('-h, --href','Encode \"s so bookmarklet can be used in <a> tags.')
	.option('-t, --tab','Escape \"s and add javascript:window.open() to start bookmarklet in new tab.')
	.action(function (inputFileName, outputFileName) {
		inputFile = inputFileName;
		outputFile = outputFileName || (function(){
			var array = inputFileName.split(".").slice(0,-1);
			array[array.length - 1] += "_marklet";
			array.push("js");
			var string = array.join(".");
			return string;
		})();
	});
 
program.parse(process.argv);
 
if (typeof inputFile === 'undefined') {
   console.error('No file name given!');
   process.exit(1);
}
console.log('Input file: ', inputFile);
console.log('Reading file...');

fs.readFile(inputFile, (err,data)=>{
	if (err) {
		console.error("File error.")
		console.error(err);
		console.error("Quitting. Goodbye.")
	}
	
	else {
		var inputCode = data;
		
		console.log("File read. Fetching Marklet code...");
		fs.readFile(markletPath, (err,data)=>{
			if (err) {
				console.error("Error reading Marklet code.")
				console.error(err);
				console.error("Quitting. Goodbye.")
				process.exit(1);
			}
			else {
				var markletCode = data;
				var code = "(function(){";
				code += inputCode;
				code += markletCode;
				code += "})();";
				
				if (program.bigly){
					console.log("Code all accounted for. Bigly mode: skipping minification.");
					var result = {"code":code};
				}
				else {
					console.log("Code all accounted for. Minifying...");
					var result = UglifyJS.minify(code);
				}
				

				if (result.error) {
					console.error(result.error);
					process.exit(1);
				}
				else {
					
					var finalCode = "javascript:" + result.code;					
					program.bigly ? null : console.log("Code minified.");
					
					if (program.href) {
						var finalCode = finalCode.replace(/"/g,"&quot;");
						console.log("Code encoded.");
					}
					else if (program.tab) {
						var finalCode = finalCode.replace(/"/g,'\\"');
						finalCode = 'javascript:window.open("' + finalCode + '");';
						console.log("Code escaped.");
					}
					
					console.log("Output file: " + outputFile);
					console.log("Writing file...");
					
					fs.writeFile(outputFile, finalCode, (err) =>{
						if (err) {
							console.error("Error reading Marklet code.")
							console.error(err);
							console.error("Quitting. Goodbye.")
							process.exit(1);
						}
						else {
							console.log("File write successful!!");
							console.log("Find the file at " + outputFile);
							console.log("Enjoy your new BookMarklet!");
						}
					});
				}
			}
		});
	}
});