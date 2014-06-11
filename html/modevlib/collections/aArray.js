/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */






(function(){
	var DEBUG=true;


	Array.newInstance=function(value){
		if (value === undefined || value==null) return [];
		if (value instanceof Array) return value;
		return [value];
	};//method


	Array.newRange=function(min, max, interval){
		if (interval===undefined) interval=1;
		if (min>max) Log.error();

		var output=[];
		for(var i=min;i<max;i+=interval) output.push(i);
		return output;
	};//method


	//WITH undefined AND nulls REMOVED
	Array.prototype.cleanCopy=function(){
		var output=[];
		for(var i=0;i<this.length;i++){
			if (this[i]===undefined || this[i]==null) continue;
			output.push(this[i]);
		}//for
		return output;
	};//method


	Array.prototype.copy = function(){
		return this.slice(0);
	};//method



	Array.prototype.forall=function(func){
		for(var i=0;i<this.length;i++){
			func(this[i], i, this);
		}//for
	};//method

	Array.prototype.insert=function(index, value){
		this.splice(index, 0, value);
	};//method



	Array.prototype.map=function(func){
		var output=[];
		for(var i=0;i<this.length;i++){
			var v=func(this[i], i);
			if (v===undefined || v==null) continue;
			output.push(v);
		}//for
		return output;
	};//method


	Array.prototype.select=function(attrName){
		var output=[];
		if (typeof(attrName)=="string"){
			for(var i=0;i<this.length;i++) output.push(this[i][attrName]);
		}else{
			for(var i=0;i<this.length;i++){
				var v=this[i];
				var o={};
				for(var a=0;a<attrName.length;a++){
					var n=attrName[a];
					o[n]=v[n];
				}//for
				output.push(o);
			}//for
		}//endif
		return output;
	};//method


	//RETURN MAP THAT USES field AS KEY TO ELEMENTS
	Array.prototype.index = function(field) {
		var output = {};
		for (var i = 0; i < this.length; i++) {
			var v = this[i];
			if (v === undefined) continue;
			output[v[field]] = v;
		}//for
	};


	Array.prototype.groupBy=function(size){
		if (size===undefined){
			Log.error("Can only handle size parameter right now");
		}//endif

		var output=[];
		for(var i=0;i<this.length;i+=size){
			output.append({"group":i/size, "values":this.slice(i, i+size)})
		}//for
		return output;
	};//method


	//WE ASSUME func ACCEPTS (row, i, rows)
	Array.prototype.filter=function(func){

		if (typeof(func) == "function") {
			//DO NOTHING
		}else{
			func = CNV.esFilter2function(func)
		}//endif

		var output=[];
		for(var i=0;i<this.length;i++){
			if (func(this[i], i)) output.push(this[i]);
		}//for
		return output;
	};//method



	//RETURN A RANDOM SAMPLE OF VALUES
	Array.prototype.sample=function(num){
		if (this.length<num) return this;

		var temp=this.map(function(u){return {"key":Math.random(), "value":u};});
		temp.sort(function(a, b){return a.key-b.key;});
		return temp.substring(0, num).map(function(v){return v.value;});
	};

	Array.prototype.append=function(v){
		this.push(v);
		return this;
	};//method




	Array.prototype.appendArray=function(arr){
//		this.reverse();
		for(var i=0;i<arr.length;i++){
			this.push(arr[i]);
		}//for
//		this.reverse();
		return this;
	};//method

	if (DEBUG){
		var temp=[0,1,2].appendArray([3,4,5]);
		for(var i=0;i<6;i++) if (temp[i]!=i)
			Log.error();
	}//endif


	Array.prototype.prepend=Array.prototype.unshift;

	Array.prototype.last=function(){
		return this[this.length-1];
	};//method

	Array.prototype.first=function(){
		return this[0];
	};//method

//	Array.prototype.indexOf=function(value){
//		for(var i=0;i<this.length;i++){
//			if (this[i]==value) return i;
//		}//for
//		return -1;
//	};//method

	Array.prototype.substring=Array.prototype.slice;

	Array.prototype.left=function(num){
		return this.slice(0, num);
	};

	//TRUNCATE ARRAY IF LONGER THAN num
	Array.prototype.limit=Array.prototype.left;

	Array.prototype.leftBut = function(amount){
		return this.slice(0, this.length - amount);
	};//method

	Array.prototype.right=function(num){
		return this.slice(Math.max(0, this.length-num));
	};

	Array.prototype.rightBut=function(num){
		if (num<=0) return this;
		return this.slice(num , this.length);
	};



	Array.prototype.remove=function(obj, start){
		while(true){
			var i=this.indexOf(obj, start);
			if (i==-1) return this;
			this.splice(i, 1);
		}//while
	};


	Array.prototype.concatenate=function(separator){
		return this.map(function(v){return v;}).join(separator);
	};

	//RETURN TRUE IF VALUE IS FOUND IN ARRAY
	Array.prototype.contains = function(value){
		return this.indexOf(value)>=0;
	};//method


	//RETURN LIST OF COMMON VALUES
	Array.prototype.intersect = function(b){
		var output = [];
		for(var i = 0; i < this.length; i++){
			for(var j = 0; j < b.length; j++){
				if (this[i] == b[j]){
					output.push(this[i]);
					break;
				}//endif
			}//for
		}//for
		return output;
	};//method


	//RETURN UNION OF UNIQUE VALUES (WORKS ON STRINGS ONLY)
	Array.prototype.union = function(b){
		var output={};
		for(var i = this.length; i--;) output[this[i]]=1;
		for(var j = b.length; j--;) output[b[j]]=1;
		return Object.keys(output);
	};//method



	Array.prototype.subtract=function(b){
		var c=[];
	A:	for(var x=0;x<this.length;x++){
		var v=this[x];
			if (v!==undefined){
				for(var y=b.length;y--;) if (v==b[y]) continue A;
				c.push(v);
			}//endif
		}//for
		return c;
	};//method
})();
