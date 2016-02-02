var fs = require('fs'); 
var file = process.argv[2];
var stats = fs.statSync(file);
if (stats['size'] == 0) {
	console.log(0);
}else {
	var array = require(file);
	console.log(array.length);
	for (var i in array){
		console.log(array[i].trade_dt); 
	}  
}
