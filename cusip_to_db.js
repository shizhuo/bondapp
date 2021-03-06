var mysql = require('mysql'); 
var fs = require('fs');
var moment = require('moment'); 

var db = mysql.createConnection({
host: 'localhost', 
user: 'szhu', 
password: 'szhu',
database: 'bondapp'
});  

var fields = {}; 

var d1 = fs.readdirSync('details');
var d2 = fs.readdirSync('details/' + d1[0]);
var d3 = fs.readdirSync('details/' + d1[0] + '/' + d2[0]); 
var d4 = fs.readdirSync('details/' + d1[0] + '/' + d2[0] + '/' + d3[0]); 
var rows;  

try {
	rows = JSON.parse(fs.readFileSync('details/' + d1[0] + '/' + d2[0] + '/' + d3[0] + '/' + d4[0], 'utf8'));
}catch(e){
	rows = {};
}
var d1n = d1.length; 
var d1i = 0; 
var d2n = d2.length; 
var d2i = 0; 
var d3n = d3.length; 
var d3i = 0; 
var d4n = d4.length; 
var d4i = 0;
var rn = 1; //number of rows;
var ri = 0; //i of rows

var next = function(){
	if (ri >= rn){
		ri = 0; 
		d4i++; 
	}
	
	if (d4i == d4n){
		d4i = 0;
		console.log('count = ' + count);  
		console.log('\t\t\t' + d3i); 
		d3i++; 
	}

	if (d3i == d3n){
		d3i = 0;
		console.log('\t\t' + d2i);  
		d2i++; 
	}

	if (d2i == d2n){
		d2i = 0; 
		console.log('\t' + d1i); 
		d1i++; 
	}

	//console.log(d1i); 
	//console.log(d2i); 
	//console.log(d3i); 
	//console.log(d4i); 

	if (d1i == d1n){
		console.log('end'); 
		return -1; 
	}

	if (d2i == 0){
		d2 = fs.readdirSync('details/' + d1[d1i]); 
		d2n = d2.length; 
	}

	if (d3i == 0){
		d3 = fs.readdirSync('details/' + d1[d1i] + '/' + d2[d2i]); 
		d3n = d3.length; 
	}
	
	if (d4i == 0){
		d4 = fs.readdirSync('details/' + d1[d1i] + '/' + d2[d2i] + '/' + d3[d3i]); 
		d4n = d4.length; 	
	}
	if (ri == 0){
		var file = 'details/' + d1[d1i] + '/' + d2[d2i] + '/' + d3[d3i] + '/' + d4[d4i];
		try{
			rows = JSON.parse(fs.readFileSync(file, 'utf8')); 
		}catch(e){
			rows = {};
		}
		rn = 1; 
	}

	if (rn == 0) {
		return 0; 
	}
	return 1; 
}


var resolve = function(message, check, arg1, then, arg2, otherwise, arg3){
	//console.log(message);
	var res = check(arg1); 
	if (res == 1 || res == 0){ //successfully
		then(arg2); 
	}else {
		otherwise(arg3); 
	}
}

var reject = function(message, check, arg1, then, arg2, otherwise, arg3){
	//console.log(message);
	var res = check(arg1); 
	if (res == 1 || res == 0) {
		then(arg2); 
	}else {
		otherwise(arg3); 
	}
}

var count = 0; 

var insert = function(){
	count++; 
	var data = rows;
	ri++;  
/*	if (count>=10000) {
		exit();
		return;  
	}

	for (var f in rows){
		fields[f] = ''; 
	}

	setTimeout(function(){
		resolve('here', next, null, insert, null, exit, null); 
	}, 0); 
*/

	if (data){
		data.dated_date = moment(new Date(data.dated_date)).format('YYYY-MM-DD'); 
		data.maturity_date = moment(new Date(data.maturity_date)).format('YYYY-MM-DD');
		data.amount = data.amount.replace(',', '').replace('$', ''); 
		data.issuer = JSON.stringify(data.issuer);
		data.next_call_date = moment(new Date(data.next_call_date)).format('YYYY-MM-DD');  
		setTimeout(function(){
			db.query('INSERT INTO cusip SET ?', data, function(err, fields){
				if (err) {
					console.log(err); 
					console.log('data = '); 
					console.log(data); 
					reject('error', next, null, null, null, exit, null); 
				}else {
					resolve('successfully inserted', next, null, insert, null, exit, null); 
				} 
			});

		}, 0); 
	}else {
		setTimeout(function(){
			resolve('empty', next, null, insert, null, exit, null); 
		}, 0); 
	}

}

var exit = function(arg){
	db.end(function(err){
		
	})
	console.log('count = ' + count); 
	//console.log(fields); 
	return; 
}

next();
insert(); 

