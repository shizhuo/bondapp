var mysql = require('mysql'); 
var fs = require('fs');
var moment = require('moment'); 

var db = mysql.createConnection({
	host: 'localhost', 
	user: 'szhu', 
	password: 'szhu',
	database: 'bondapp'
});  


var dates = fs.readdirSync('data'); 
var states = fs.readdirSync('data/' + dates[0]);
var rows;  

try {
	rows = JSON.parse(fs.readFileSync('data/' + dates[0] + '/' + states[0], 'utf8'));
}catch(e){
	rows = [];
}

var dn = dates.length; //number of dates;
var di = 0; //i of dates
var sn = states.length; //number of states;
var si = 0; //i of states
var rn = rows.length; //number of rows;
var ri = 0; //i of rows

var next = function(){
	
	if (ri >= rn){
		ri = 0; 
		si++; 
	}
	if (si == sn) {
		si = 0; 
		di++; 
	}
	
	if (di == dn){
		console.log('end'); 
		return -1; //end the program;  
	}

	if (si == 0){
		states = fs.readdirSync('data/' + dates[di]); 
		sn = states.length; 
	}
	if (ri == 0){
		var file = './data/' + dates[di] + '/' + states[si]; 
		console.log(file); 
		try {
			rows = JSON.parse(fs.readFileSync(file, 'utf8'));
		}catch(e){
			rows = [];
		}
		rn = rows.length; 
		console.log('rn = '+ rn); 
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

var insert = function(){
	var data = rows[ri++]; 
	if (data){
		data.trade_dt = moment(new Date(data.trade_dt)).format('YYYY-MM-DD HH:mm:ss');  
		data.maturity_date = moment(new Date(data.maturity_date)).format('YYYY-MM-DD'); 
		data.amount = data.amount.replace(',', ''); 
		data.state = states[si]; 
		data.description = data.desc; 
		delete data.desc; 
		//console.log('data = '); 
		//console.log(data);
		setTimeout(function(){
			db.query('INSERT INTO history SET ?', data, function(err, fields){
				if (err) {
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
	return; 
}

next();
insert(); 

