var fs = require('fs'); 
var moment = require('moment');
var childprocess; 

try{
	childprocess = require('child_process'); 
}catch (e){
	console.log(e, 'child process error'); 
}
var done = false; 
 
var casper = require('casper').create({
		waitTimeout: 10000,
		stepTimeout: 10000,
		onStepTimeout: function(){
			console.log('step time out');
			process_next(this); 
		},
    pageSettings: {
        webSecurityEnabled: false
    }
});

var start_url = 'http://emma.msrb.org/SecurityView/SecurityDetails.aspx?cusip=A205D98C81B7205A5066395C7F3D9D577';

var record = {};  
var start;
var path; 
var cusip;  
function get_path(cusip){
	var d1 = cusip.substring(0,2);
	var d2 = cusip.substring(2,3); 
	var d3 = cusip.substring(3,4); 
 
	var path = 'details/' + d1 + '/' + d2 + '/' + d3 + '/' + cusip + '.json'; 
	return path; 
}

function process_discovery(casper, cusip){
	var fields = casper.getElementsInfo('div#searchCriteria  li div.c-name'); 
	var values = casper.getElementsInfo('div#searchCriteria  li div.c-value'); 
	
	var j = 0;
	var rfs = [];  
	var should_ocr = 0; 
	var ocred = 0; 
	for (var i = 0; i < fields.length; i++){
		var f = fields[i].attributes.class.substring(10);
		var v = values[i].html;
		var v1 = v.replace(/amp;/g, ''); 
		if (v !== v1){
			v1 = v1.substring(10, v1.length-2);   
			v = 'http://emma.msrb.org' + v1; 
			rfs[j] = cusip + f + '.png';
			casper.download(v, rfs[j]);
			console.log(v + ' downloaded');  
			should_ocr = should_ocr | (1 << j); 

			if (childprocess){
				childprocess.execFile('./gocr.sh', [rfs[j], f, j], null, function(err, stdout, stderr){
					if (err) {
						console.log('err:' + err); 
					} else {
						var a = JSON.parse(stdout); 
						record[a[1]+'_ocr'] = a[2].trim().replace(/\s*/g, '');  
						console.log(record[a[1]+'_ocr']); 
						var index = a[3]; 
						ocred = ocred | (1 << index); 
					}
					childprocess.execFile('rm', [a[0]], null, function(err, stdout, stderr){
						//delete img file after processing.  
					});
				})	
			}
			j++; 
		}
		record[f] = v; 
	}

	casper.waitFor(function check(){
			return ocred == should_ocr;		
		}, function then(){
			done = true; 
		}, function timeout(){
			console.log('timeout');
			done = true; 
	}, 5000);

 
}

function process_details(casper, cusip){
	record = {}; 
	record.cusip = cusip; 
	record.desc_1 = casper.getHTML('a.issueDataLink'); 
	record.desc_2 = ''; 
	try{
		record.desc_2 = casper.getHTML('div.securityHeaderDiv div:not([class]) span:not([class])');
	}catch(error){
		//console.log(error); 
	}

	var fields = casper.getElementsInfo('div.securityHeaderDiv div.value span.label'); 	
  var values = casper.getElementsInfo('div.securityHeaderDiv div.value span.label + span'); 

	for (var i = 0; i < fields.length; i++){
		if (fields[i].html.search('Dated Date')!=-1){
			record.dated_date = values[i].html; 
		}else if (fields[i].html.search('Maturity')!=-1){
			record.maturity_date = values[i].html; 
		}else if (fields[i].html.search('Interest Rate') != -1){
			record.interest_rate = values[i].html; 
		}else if (fields[i].html.search('Amount')!=-1){
			record.amount = values[i].html; 
		}else if (fields[i].html.search('Initial Offering Price/Yield')!=-1){
			record.price = values[i].html;
		}
	}

	var issuer = []; 
	values = casper.getElementsInfo('div.issuerLinksContainer li a.fullName');
 

	for (i = 0; i < values.length; i++){
		var v = values[i].attributes.help; 
		issuer.push(v); 
	}
	record.issuer = issuer; 

}

function process_next(casper){
	console.log('================'); 
	start = moment();
	if (!childprocess) {
		console.log('child process does not exist'); 
		return; 
	}
	done = false;
	casper.then(function(){ 
		childprocess.execFile('./get_next_cusip.sh', [], null, function(error, stdout, stderr){
			if (error){
				console.log('err: ' + error); 
				done = true;  
			}else {
				cusip = stdout;
				cusip = cusip.trim();  
  
				if (cusip == '') {
					console.log('cusip is empty'); 
					done = true; 
					return; 
				}
				console.log('cusip = ' + cusip + ' retrieved;'); 
				detail_url = 'http://emma.msrb.org/SecurityDetails/TradeActivity/' + cusip; 
				discovery_url = 'http://emma.msrb.org/TradeData/PriceDiscovery/' + cusip; 
				casper.thenOpen(detail_url, function(){
					this.waitForText('Security Details', function then(){
						process_details(this, cusip); 
					}, function timeout(){
						console.log('wait for text timeout'); 
						done = true; 
					}, 10000); 
				});
				casper.thenOpen(discovery_url, function(){
					this.waitForSelector('input#searchButton', function then(){
    				process_discovery(this, cusip); 
					}, function timeout(){
    				console.log('wait for selector timeout'); 
						done = true; 
					}, 10000);
				
				}); 
			}
		}); 
	}); 
	wait_to_process_next(casper); 

}

function wait_to_process_next(casper){
	casper.waitFor(function check(){
		return done; 
	}, function then(){
		if (cusip != undefined){
			path = get_path(cusip); 
			console.log(JSON.stringify(record));
			fs.write(path, JSON.stringify(record), 'w');  
			var end = moment(); 
			var diff = end.diff(start); 
			console.log('spent ' + diff/1000 + ' seconds'); 
		}
		process_next(casper); 			 
	}, function timeout(){
		console.log('timeout');
		process_next(casper);  
	}, 5000); 


}


casper.start(start_url, function() {
		
	//to accept the disclaimer; 
	this.click('input#ctl00_mainContentArea_disclaimerContent_yesButton');
	this.waitForText('Security Details', function then(){
		done = true; 
	}, function timeout(){
		console.log('wait for text timeout'); 
		this.exit(); 
	}, 10000);

	wait_to_process_next(casper); 
 
});

casper.run(function() {
	console.log('done = ' + done); 
	console.log('program finished'); 	
	this.exit(); 
});
