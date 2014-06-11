/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


//THIS IS A DATA CUBE, WITH ONLY INTEGER INDICES
//THIS IS NOT A STANDARD MATHEMATICAL MATRIX
Matrix=function(arg){
	if (arg.data){
		this.dim=[];
		var d=arg.data;
		while (d instanceof Array) {
			this.dim.append(d.length);
			d = d[0];
		}//while
		this.num=this.dim.length;
		this.data=arg.data;
	}else if (arg instanceof Array){
		//EXPECTING COORDINATES ARRAY
		this.num=arg.length;
		this.dim=arg;
	}else{
		Log.error("not supported")
	}//endif
};//function



//PROVIDE func(v, i, c, cube) WHERE
// v - IS A VALUE IN THE CUBE
// i - IS THE INDEX INTO THE edge
// c - AN ARRAY OF COORDINATES v IS FOUND AT
// cube - THE WHOLE CUBE
Matrix.prototype.forall = function (edge, func) {
	var data=this.data;
	var num = this.num;
	var c = Uint32Array(this.num);

	function iter(v, d) {
		if (d == num) {
			func(v, c[edge], c, data);
		} else {
			for (var j = 0; j < v.length; j++) {
				c[d]=j;
				iter(v[j], d+1);
			}//for
		}//endif
	}//function
	iter(data, 0);
};

//PROVIDE func(v, i, c, cube) WHERE
// v - IS A VALUE IN THE CUBE
// i - IS THE INDEX INTO THE edge
// c - AN ARRAY OF COORDINATES v IS FOUND AT
// cube - THE WHOLE CUBE
// func MUST RETURN A NEW VALUE
Matrix.prototype.map = function (edge, func) {
	var data=this.data;
	var num = this.num;
	var c = Uint32Array(this.num);

	function iter(v, d) {
		if (d == num) {
			return func(v, c[edge], c, data);
		} else {
			var output=[];
			for (var j = 0; j < v.length; j++) {
				c[d]=j;
				output.append(iter(v[j], d+1));
			}//for
			return output;
		}//endif
	}//function
	return iter(data, 0);
};

//PROVIDE func(v, i, c, cube) WHERE
// v - IS A SUB-CUBE
// i - IS THE INDEX INTO THE edge
// c - AN ARRAY OF PARTIAL COORDINATES v IS FOUND AT
// cube - THE WHOLE CUBE
// func MUST RETURN A SUBCUBE, OR undefined
Matrix.prototype.filter = function (edge, func) {
	var data=this.data;
	var c = new Uint32Array(edge);

	function iter(v, d) {
		var output=[];
		if (d == edge) {
			for (var k = 0; k < v.length; k++) {
				var u = func(v[k], k, c, data);
				if (u!==undefined) output.append(u);
			}//for
		} else {
			for (var j = 0; j < v.length; j++) {
				c[d]=j;
				output.append(iter(v[j], d+1));
			}//for
		}//endif
		return output;
	}//function
	return iter(data, 0);
};


