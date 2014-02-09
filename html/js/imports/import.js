////////////////////////////////////////////////////////////////////////////////
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
////////////////////////////////////////////////////////////////////////////////
// Author: Kyle Lahnakoski  (kyle@lahnakoski.com)
////////////////////////////////////////////////////////////////////////////////


//REASONS FOR GLOBALS IN PACKAGE CONTEXT
//http://lisperator.net/blog/thoughts-on-commonjs-requirejs/


//AN ARRAY WILL DEMAND LOAD ORDER
//THIS FUNCTION CAN ONLY BE RUN ONCE, AFTER WHICH IT WILL REPLACE ITSELF WITH A NULL FUNCTION
var importScript;


(function(){

	var METHOD_NAME = "importScript";
	var DEBUG = false;


	if (typeof(window.Log) == "undefined"){
		window.Log = {
			"note":function(message){
				console.log(message);
			},
			"error":function(message){
				console.error(message);
				throw message;
			}
		};
	}//endif



	var code = {};
	var dependencies = [];
	var todo = [];
	var numRemaining = 0;

	function quote(value){
		return "\"" + (value + '').replace(/([\n\\"'])/g, "\\$1").replace(/\0/g, "\\0") + "\"";
	}

	function unquote(value){
		var o = "";
		var s = 0;
		var e = value.indexOf("\\");
		while(e >= 0){
			var r = "\\\"\t\r\n".charAt("\\\"trn".indexOf(value.charAt(e + 1)));
			o = o + value.substring(s, e) + r;
			s = e + 2;
			e = value.indexOf("\\", s);
		}//while
		return o + value.substring(s);
	}//method

	function subtract(a, b){
		var c = [];
		A:	for(var x = 0; x < a.length; x++){
			if (a[x] !== undefined){
				for(var y = 0; y < b.length; y++) if (a[x] == b[y]) continue A;
				c.push(a[x]);
			}//endif
		}//for
		return c;
	}//method

	function contains(array, element){
		for(var i = array.length; i--;){
			if (array[i] == element) return true;
		}//for
		return false;
	}//method

	////////////////////////////////////////////////////////////////////////////
	// SCRIPTS WITH THE MAGIC METHOD WILL RECORD THEIR DEPENDENCIES
	// AND THEIR CODE FOR LATER EXECUTION
	////////////////////////////////////////////////////////////////////////////
	function preprocess(parentPath, src){
		//FIND IMPORT STATEMENTS
		var found = src.indexOf(METHOD_NAME);
		while(found >= 0){
			found += METHOD_NAME.length;
			if (src.substring(found, src.indexOf("(", found)).trim() != ""){
				//NOT A METHOD CALL
				found = src.indexOf(METHOD_NAME, found);
				continue;
			}//endif

			var s = src.indexOf("(", found);
			var e = src.indexOf(")", s);	//HOPEFULLY THIS WILL CATCH THE PARAMETERS (FAILS WHEN COMMENTS EXIST)

			var f = "addDependency(" + quote(parentPath) + ", " + src.substring(s + 1, e + 1);
			eval(f);

			found = src.indexOf(METHOD_NAME, e);
		}//while
		var scriptBegin = src.indexOf(";", src.indexOf(")", e)) + 1;
		return scriptBegin;
	}//method


	function readfile(fullPath, callback){
		var request = new XMLHttpRequest();
		try{
			var url = window.location.protocol + "//" + window.location.hostname + fullPath;
			request.open('GET', url);
			request.isDone = false;
			request.onreadystatechange = function(){
				if (request.readyState == 4){
					if (request.status == 200 || request.status == 0){
						if (request.isDone) return;
						request.isDone = true;
						if (DEBUG) Log.note("GOT " + url);
						callback(request.responseText);
					} else{
						Log.error("What!?!");
						callback(null);
					}//endif
				}//endif
			};
			request.onload = function(){
				if (request.status == 200 || request.status == 0){
					if (request.isDone) return;
					request.isDone = true;
					if (DEBUG) Log.note("GOT " + url);
					callback(request.responseText);
				} else{
					Log.error("What!?!");
					callback(null);
				}//endif
			};
			if (DEBUG) Log.note("GET " + url);
			request.send(null);
		} catch(e){
			Log.error("Can not read " + fullPath + " (" + e.message + ")");
			callback(null);
		}//try
	}

	function shortPath(fullPath){
		return fullPath.substring(fullPath.lastIndexOf("/") + 1);
	}//function


	function getFullPath(parentScriptPath, relativePath){

		var e = parentScriptPath.lastIndexOf("/");
		if (e == -1){
			parentScriptPath = ".";
		} else{
			parentScriptPath = parentScriptPath.substring(0, e);
		}//endif

		var absPath;
		if (
			relativePath.indexOf("://")>0 ||
			relativePath.charAt(0) == '/'
		){
			absPath = relativePath;	//NOT RELATIVE
		} else{
			absPath = parentScriptPath + "/" + relativePath;
		}//endif

		absPath = absPath.replace("/./", "/");
		if (absPath.substring(0, 2) == "./") absPath = absPath.substring(2);

		var e = absPath.indexOf("/..");
		while(e >= 0){
			var s = absPath.lastIndexOf("/", e - 1);
			if (s >= 0){
				absPath = absPath.substring(0, s) + absPath.substring(e + 3);
			}//endif
			e = absPath.indexOf("/..");
		}//endif

		return absPath;
	}//function


	function addScripts(paths, doneCallback){
		var head = document.getElementsByTagName('head')[0];
		var existingScripts = [window.location.pathname];

		var scripts = head.getElementsByTagName('script');
		for(var s = 0; s < scripts.length; s++){
			var p = scripts[s].getAttribute("src");
			var fp = getFullPath(window.location.pathname, p);
			existingScripts.push(fp);
		}//for


		//<link type="text/css" rel="stylesheet" href="tests.lib/webdetails/tests.lib/tipsy.css"/>
		var css = head.getElementsByTagName('link');
		for(s = 0; s < css.length; s++){
			p = css[s].getAttribute("href");
			fp = getFullPath(window.location.pathname, p);
			existingScripts.push(fp);
		}//for


		var netPaths = subtract(paths, existingScripts);

		var numLoaded = netPaths.length;
		if (DEBUG) Log.note("Waiting for " + numLoaded + " scripts to load");

		function onLoadCallback(){
			numLoaded--;
			if (numLoaded == 0){
				doneCallback();
			}//endif
		}

		var frag=document.createDocumentFragment();   //http://ejohn.org/blog/dom-documentfragments/
		for(var i = 0; i < netPaths.length; i++){
			if (DEBUG) Log.note("Add script: " + shortPath(netPaths[i]));
			if (netPaths[i].substring(netPaths[i].length - 4) == ".css"){
				//<link type="text/css" rel="stylesheet" href="tests.lib/webdetails/tests.lib/tipsy.css"/>
				var newCSS = document.createElement('link');
				newCSS.type = 'text/css';
				newCSS.rel = "stylesheet";
				newCSS.href = netPaths[i];
				frag.appendChild(newCSS);
				numLoaded--;
			} else{
				var script = document.createElement('script');
				script.type = 'text/javascript;version=1.7';
				script.onload = onLoadCallback;
				script.async = false;
				script.src = netPaths[i];
				frag.appendChild(script);
			}//endif
		}//for
		head.appendChild(frag);
		if (numLoaded == 0) doneCallback();
		if (DEBUG) Log.note("Added " + numLoaded + " scripts");
	}//function


	function sort(edges){
		var processed = [];
		var unprocessed = [];
		var queue = [];

		function processList(){
			while(processed.length < numberOfNodes){
				for(var i = 0; i < unprocessed.length; i++){
					var nodeid = unprocessed[i];
					if (graph[nodeid].indegrees === 0){
						queue.push(nodeid);
						unprocessed.splice(i, 1); //Remove this node, its all done.
						i--;//decrement i since we just removed that index from the iterated list;
					}//endif
				}//for

				{//HACK
					//THIS IS AN UNPROVEN HACK TO SOLVE THE CYCLE PROBLEM
					//IF A PARENT OF unprocessed NODE HAS BEEN VISITED, THEN THE NODE WILL
					//HAVE __parent DEFINED, AND IN THEORY WE SHOULD BE ABLE CONTINUE
					//WORKING ON THOSE
					if (queue.length == 0 && unprocessed.length > 0){
						var hasParent = unprocessed.map(function(v, i){
							if (graph[v].__parent !== undefined) return v;
						});
						if (hasParent.length == 0) Log.error("Isolated cycle found");
						hasParent = subtract(hasParent, processed);
						unprocessed = subtract(unprocessed, hasParent);
						for(var k = 0; k < hasParent.length; k++){
							if (DEBUG && contains(processed, hasParent[k]))
								Log.error("Duplicate pushed!!");
							queue.push(hasParent[k]);
//							unprocessed.remove([hasParent[k]]);
						}
					}//endif
				}//END OF HACK

				var next = queue.shift();
				processStartingPoint(next);
			}//while
		}//method


		function processStartingPoint(nodeId){
			if (nodeId == undefined){
				throw "You have a cycle!!";
			}
			for(var i = 0; i < graph[nodeId].children.length; i++){
				var child = graph[nodeId].children[i];
				graph[child].indegrees--;
				graph[child].__parent = graph[nodeId];		//MARKUP FOR HACK
			}//for

			var node = graph[nodeId].id;
			if (DEBUG && contains(processed, node))
				Log.error("Duplicate pushed!!");
			processed.push(node);
		}//method


		function addVertex(name){
			if (graph[name] === undefined){
				var n = {};
				n.id = name;
				n.indegrees = 0;
				n.children = [];
				graph[name] = n;
				if (DEBUG && contains(unprocessed, name))
					Log.error("Duplicate pushed!!");
				unprocessed.push(name);
			}//endif
		}//method


		//POPULATE STRUCTURES TO DO THE SORTING
		var graph = {};
		for(var i = 0; i < edges.length; i++){
//			if (DEBUG) Log.note(JSON.stringify(e));
			var e = edges[i];
			addVertex(e.file);
			addVertex(e.import);

			graph[e.import].children.push(e.file);
			graph[e.file].indegrees += 1;
		}//for
		var numberOfNodes = Object.keys(graph).length;
		processList();

		if (processed.length != numberOfNodes) Log.error("broken");
		return processed;
	}//method


	////////////////////////////////////////////////////////////////////////////////
	// IMPORT ALL SCRIPTS
	// done IS THE FUNCTION TO RUN WHEN EVERYTHING HAS BEEN LOADED
	////////////////////////////////////////////////////////////////////////////////
	function _importScript_(done){
		while(todo.length > 0){
			var nextFile = todo.pop();
			if (code[nextFile]) continue;
			if (//DO NOT TRY TO LOAD THESE
				nextFile.substring(nextFile.length - 4) == ".css" ||
				nextFile.substring(0, 7)=="http://" ||
				nextFile.substring(0, 8)=="https://"
			){
				code[nextFile] = nextFile;
				continue;
			}//endif
			code[nextFile] = "//";  //DUMMY DO NOTHING

			numRemaining++;
			(function(fullPath){
				readfile(fullPath, function(code){
					var scriptBegin = preprocess(fullPath, code);
					code[fullPath] = code.substring(scriptBegin);

					numRemaining--;
					//CHECK FOR MORE WORK
					_importScript_(done);
				});
			})(nextFile);
		}//while
		if (numRemaining > 0) return;

		var sortedPaths = sort(dependencies);
		addScripts(sortedPaths, done);
	}//method


	//COLLECT ALL THE SCRIPT DEPENDENCIES
	function addDependency(parentPath, importPath){
		var file;

		if (typeof(importPath) == "string"){
			file = getFullPath(parentPath, importPath);
			dependencies.push({"file":parentPath, "import":file});
			todo.push(file);
		} else if (importPath instanceof Array){
			var previous;
			for(var i = 0; i < importPath.length; i++){
				file = getFullPath(parentPath, importPath[i]);
				if (previous) dependencies.push({"file":file, "import":previous});
				dependencies.push({"file":parentPath, "import":file});

				todo.push(file);
				previous = file;
			}//for
		}//endif
	}//method


	//AN ARRAY WILL DEMAND LOAD ORDER
	importScript = function(importFile, code){
		addDependency(window.location.pathname, importFile);
		importScript = function(){}; //ONLY RUN ONCE
		_importScript_(code);
	};//method


})();
