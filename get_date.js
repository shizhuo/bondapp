var moment = require('moment');

var start = process.argv[2]; 
var n = process.argv[3]; 
var now = moment(new Date(start)).add(n, 'days').format('MM/DD/YYYY'); 
console.log(now); 
  
