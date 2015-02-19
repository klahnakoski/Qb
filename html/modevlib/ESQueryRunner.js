
function ESQueryRunner(query, callback){
	Thread.run(function*(){
		try {
			yield(ESQuery.loadColumns(query));
		}catch(e){
			if (!e.contains("No index with name ")) Log.error("Problem sending query", e);
			//USE THE ACTIVE DATA SERVICE
			return ActiveDataQuery(query, callback);
		}//try
		var cubeQuery = new ESQuery(query);
		var data = yield(cubeQuery.run());
		callback(data);
	});
}//method


function ActiveDataQuery(query, callback){
	//USE THE ACTIVE DATA SERVICE
	try {
		var response = yield(Rest.get({
			"url": Settings.active_data.host + (Settings.active_data.port ? ":" + Settings.active_data.port : "") + Settings.active_data.path
			"data": convert.value2json(query)
		}));

		var result = convert.json2value(response);
		callback(result)
	}catch(e){
		Log.error("Call to ActiveData failed", e)
	}//try
}//method


function ESQueryRunMany(queries, callback){
	//ASSUME queries IS AN ARRAY
	Thread.run(function*(){
		//LAUNCH ALL QUERIES
		var threads=[];
		for(var i=0;i<queries.length;i++){
			threads[i]=Thread.run((function*(j){
				yield(ESQuery.loadColumns(query));
				var cubeQuery = new ESQuery(queries[j]);
				var data = yield(cubeQuery.run());
				yield (data);
			})(i));
		}//for

		//COLLECT ALL RESULTS
		data=[];
		for(var i=0;i<queries.length;i++){
			data[i]=threads[i].join().threadResponse
		}//for

		//EXECUTE CALLBACK
		callback(data);
	});
}//method



importScript([
	"modevlib/aLibrary.js",
	"modevlib/qb/ESQuery.js"
], function(){
	return "done";
});
