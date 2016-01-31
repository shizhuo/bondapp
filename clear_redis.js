var redis = require('redis');
var client = redis.createClient();  

function clear_redis(q){
	client.lpop(q, function(err, reply){
		console.log('poping:' + reply);
		console.log(err); 
		 
		while (reply != null){
			console.log(reply); 
			clear_redis(q);
		}

		return; 
	}); 
}

clear_redis('queue');


