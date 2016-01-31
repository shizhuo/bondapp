var fs = require('fs'); 
var casper = require('casper').create();

var file = ''; 

casper.start('http://emma.msrb.org/', function() {
	
		file = '837151MQ9.dat'; 
		this.click('input#quickSearchText');  
    this.sendKeys('input#quickSearchText', '837151MQ9', {keepFocus: true});
		this.click('input#quickSearchButton');

});

casper.waitForUrl(/SecurityView\/SecurityDetails\.aspx/, function(){
})

casper.then(function() {

	this.click('input#ctl00_mainContentArea_disclaimerContent_yesButton');

});

casper.waitForUrl(/SecurityView\/SecurityDetails\.aspx/, function(){
})

casper.then(function(){
	this.click('a#ctl00_mainContentArea_tradeDetailsLink'); 
}); 

casper.waitForUrl(/SecurityDetails\/TradeActivity/, function(){

	var body = this.getHTML('body');  
	var data = body.match(/tradeData[^\n]*/g)[0]; 
	data = data.substring(12, data.length - 1);
	fs.write(file, data, 'w'); 
	//var dataObj = JSON.parse(data); 
	//console.log(dataObj); 
	//this.echo(dataObj); 

}); 

casper.run(function() {
	this.exit(); 
});
