var fs = require('fs'); 
var moment = require('moment'); 
var casper = require('casper').create({
    pageSettings: {
        webSecurityEnabled: false
    }
});

//var file = ''; 
var img = ''; 
var cusip; 
var states = []; 

var fields = ['trade_dt', 'cusip', 'description', 'maturity_date', 'interest_rate', 'price', 'yield', 'trade_amount', 'type', 'special_condition']; 

var start = moment(); 

var p1 = casper.cli.get(0); 
var p2 = casper.cli.get(1); 

var file = 'data/' + moment(new Date(p1)).format('YYYY-MM-DD'); 

function process_table(casper, count){
	var table = casper.getHTML('table#lvSearchResults tbody');
	trs = table.split('</tr><tr'); 

	var pages = Math.ceil(count/100); 
	var page = casper.getHTML('a.paginate_active'); 
	var records = []; 
	while (page <= pages){
		console.log('processing page: ' + page); 						
		table = casper.getHTML('table#lvSearchResults tbody');
		trs = table.split('</tr><tr'); 
 
		for (var j = 0; j < trs.length; j++){ 
			var record = {};  	

			var tr = trs[j]; 
			var tds = tr.split('</td><td'); 
			for (var k = 0; k < tds.length; k++){
				var td = tds[k]; 

				if (k == 0){
					var value = td.match(/\>[0-9][^\n]*/g)[0].substring(1); 
					record.trade_dt = value; 
				}else if (k == 1){
					var img = td.match(/<img[^\n]*underline=true\"/g)[0]; 
					var src = img.match(/src[^\n]*/g)[0];
					src = src.substring(5, src.length-1);
					src = src.replace('&amp;', '&');  
					var url = 'http://emma.msrb.org' + src;   
					var fake_cusip = src.match(/cusip9=[^&]*/g)[0].substring(7); 
					var d1 = fake_cusip.substring(0,2);
					var d2 = fake_cusip.substring(2,3); 
					var d3 = fake_cusip.substring(3,4);  
					var path = 'cusip2/' + d1 + '/' + d2 + '/' + d3 + '/' + fake_cusip + '.png'; 
					console.log(path); 
					casper.download(url, path);  
					record.cusip = fake_cusip; 
				}else if (k == 2){
					var value = td.match(/<a[^\n]*/g)[0];
					value = value.match(/>[^\n]*/g)[0]; 
					value = value.substring(1, value.length-4);  
					record.desc = value; 
				}else if (k == 3){
					var value = td.match(/>[^\n]*/g)[0].substring(1); 
					record.maturity_date = value; 
				}else if (k == 4){
					var value = td.match(/>[^\n]*/g)[0].substring(1); 
					record.interest_rate = value; 
				}else if (k == 5){
					var value = td.match(/>[^\n]*/g)[0].substring(1); 
					record.price = value; 
				}else if (k == 6){
					var value = td.match(/>[^\n]*/g)[0].substring(1); 
					record.yield = value; 
				}else if (k == 7){
					//console.log(td);
				}else if (k == 8){
					var value = td.match(/>[^\n]*/g)[0].substring(1); 
					record.amount = value; 
				}else if (k == 9){
					var value = td.match(/>[^\n]*/g)[0].substring(1); 
					record.type = value; 
				}else if (k == 10){
					var value = td.search(/<\/tr>/g); 
					if (value != -1) {
						value = td.substring(0, td.length - 5); 
					}else {
						value = td; 
					}
					value = value.substring(10, value.length - 5); 	
					if (value != ''){
						value = value.match(/help[^\n]*/g)[0]; 
						value = value.substring(6, value.length - 2); 
					}
					record.special_condition = value; 
				}	
			}
			records.push(record); 
		}
		 
		if (page < pages){
			casper.click('a.next.paginate_button');
			page = casper.getHTML('a.paginate_active'); 
			console.log('change to page: ' + page); 
		}else {
			console.log('processed all data'); 
			break; 
		}
	}
	
	fs.write(file, JSON.stringify(records), 'w');  
}

casper.start('http://emma.msrb.org/TradeData/Search', function() {
		
	//to accept the disclaimer; 
	this.click('input#ctl00_mainContentArea_disclaimerContent_yesButton');
	this.waitForSelector('button.ui-multiselect', function(){
		var date = moment(new Date(p1)).unix();
		var today = moment(new Date()).unix(); 
		this.echo(date); 
		
		var d = moment.unix(date).format('MM/DD/YYYY'); 
		console.log('processing: ' + d);
		this.click('input#tradeDateFrom'); 
		this.sendKeys('input#tradeDateFrom', d, {keepFocus: true});
		this.click('input#tradeDateTo'); 
		this.sendKeys('input#tradeDateTo', d, {keepFocus: true}); 
		var o = p2;
			
		var state = this.getElementAttribute('input#ui-multiselect-state-option-' + o, 'title');
		console.log('option = ' + o + '; ' + state);  
		file += '/' + state + '.json'; 
		this.click('button.ui-multiselect'); 
		this.click('input#ui-multiselect-state-option-' + o);
		this.click('input#searchButton');
		this.waitUntilVisible('div.data-grid, div.no-record', function(){
			var no_record = this.getElementAttribute('div.no-record', 'style'); 
			if (no_record.search('display: none;') == -1) {
				fs.write(file, '', 'w'); 
				return; 
			}
			this.fill('div#lvSearchResults_length', {
				'lvSearchResults_length': ['100']
			}); 
  
			var count = this.getHTML('div#tradeCount');
			console.log(count); 
			count = count.match(/[0-9]*/g)[0];
  
			//wait for results to load	
			var displaying = (count < 100)? count:100; 
			this.waitFor(function check(){
				
				var d = this.getHTML('#lvSearchResults_info');
				var value; 
				
				if (d.search('to ' + displaying)!=-1){
					value = true;
				}else {
					value = false; 
				}
				return value; 
			}, function then(){
  			process_table(this, count);  
			}, function timeout(){
  			console.log('time out'); 
			});
			
		});  	
	}); 
});

casper.run(function() {
	var end = moment(); 
	var diff = end.diff(start); 
	console.log('spent ' + diff/1000 + ' seconds'); 	
	this.exit(); 
});
