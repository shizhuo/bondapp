var states = require('./states.json'); 

var state = process.argv[2]; 

for (var i = 0; i < states.length; i++){
	if (states[i] == state){
		console.log(i);
		return; 
	}
}
