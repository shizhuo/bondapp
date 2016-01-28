var fs = require('fs'); 
var moment = require('moment');
var childprocess; 

try{
	childprocess = require('child_process'); 
}catch (e){
	console.log(e, 'child process error'); 
}
 
var casper = require('casper').create({
    pageSettings: {
        webSecurityEnabled: false
    }
});

var cusip = casper.cli.get(0); 
var detail_url = 'http://emma.msrb.org/SecurityDetails/TradeActivity/' + cusip; 
var discovery_url = 'http://emma.msrb.org/TradeData/PriceDiscovery/' + cusip; 
var start = moment(); 

var d1 = cusip.substring(0,2);
var d2 = cusip.substring(2,3); 
var d3 = cusip.substring(3,4); 
 
var path = 'details/' + d1 + '/' + d2 + '/' + d3 + '/' + cusip + '.json'; 
var record = {}; 
record.cusip = cusip; 

function process_discovery(casper){
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
			should_ocr = should_ocr | (1 << j); 
			if (childprocess){
				childprocess.execFile('./gocr.sh', [rfs[j], f, j], null, function(err, stdout, stderr){
					if (err) {
						console.log('err:' + err); 
					} else {
						var a = JSON.parse(stdout); 
						record[a[1]+'_ocr'] = a[2].trim().replace(/\s*/g, '');  
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
			//console.log('done'); 
		}, function timeout(){
			console.log('timeout'); 
	}); 

}

function process_details(casper){
	record.desc_1 = casper.getHTML('a.issueDataLink'); 
	record.desc_2 = casper.getHTML('div.securityHeaderDiv :nth-child(2) span');
	record.dated_date = casper.getHTML('div.securityHeaderDiv :nth-child(6) :nth-child(2)');
	record.maturity_date = casper.getHTML('div.securityHeaderDiv :nth-child(8) :nth-child(2)'); 
	record.interest_rate = casper.getHTML('div.securityHeaderDiv :nth-child(10) :nth-child(2)'); 
	record.amount = casper.getHTML('div.securityHeaderDiv :nth-child(12) :nth-child(2)');
	record.price = casper.getHTML('div.securityHeaderDiv :nth-child(14) :nth-child(2)');
	record.issuer = casper.getHTML('a.fullName');   

}

casper.start(detail_url, function() {
		
	//to accept the disclaimer; 
	this.click('input#ctl00_mainContentArea_disclaimerContent_yesButton');
	this.waitForText('Security Details', function(){
		process_details(this); 
	}); 
});

casper.thenOpen(discovery_url, function(){
	this.waitForSelector('input#searchButton', function(){
		process_discovery(this); 
	}); 
}); 

casper.run(function() {

/*
	for(var i in record){
		console.log(i + ':'); 
		console.log('\t' + record[i]);
	}
*/
	console.log(cusip + ' done;'); 
	fs.write(path, JSON.stringify(record), 'w'); 		
 
	var end = moment(); 
	var diff = end.diff(start); 
	console.log('spent ' + diff/1000 + ' seconds'); 	
	this.exit(); 
});
