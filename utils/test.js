var createLineReader = require('./WatchFile');


var read = new createLineReader("D:\\node\\log4js-example\\log\\app.log");
read.on('line', function(line){
	console.log(line.toString());
});

read.on('end', function(){
	console.log('end');
})