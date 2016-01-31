var moment = require('moment'); 
var fs = require('fs'); 
var redis = require('redis');
var client = redis.createClient();  

var states = require('./states.json'); 

var date = moment(new Date('01/01/2015')); 

var year = date.year(); 

var count = 0; 
while (year == 2015){
	var d = date.format('YYYY-MM-DD'); 
	//console.log(d); 
	for (var option = 0; option < 57; option++){
		//console.log(states[option]); 
		var path = 'data/' + d + '/' + states[option] + '.json'; 
		try{
			fs.statSync(path);
			//console.log(states[option] + 'exists'); 
		}catch(error){
			//console.log(states[option] + 'does not exist');
			var str = date.format('MM/DD/YYYY') + ":" + option; 
			count++; 
			client.lpush('queue', str, function(err, reply){
				//console.log(reply); 
			});  
		}
	}
	date = date.add(1, 'days'); 
	year = date.year();  
}

console.log(count + ' states are missing'); 

