var http = require('http');
var https = require('https'); 
var querystring = require('querystring'); 
 
var data = ''; 
var i = 0; 



http.get("http://emma.msrb.org/TradeData/MostActivelyTradedRefresh", function(res) {
	res.setEncoding('utf8');
	res.on('data', function(chunk){
		data += chunk; 
		i++; 
		console.log("=========" + i + "==============");

		try{
			var json = JSON.parse(data); 
		}catch(err){
			console.log(err); 
			return; 
		}	
		console.log(json.data); 

	});
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});



