var fs=require('fs');
var EM = require("events").EventEmitter;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var newlines = [
    //13, // \r
    10  // \n
];
function createLineReader(fileName) {
    if (!(this instanceof createLineReader)) return new createLineReader(fileName,monitorFlag);
    var self=this;
    var currentFileUpdateFlag=0;
    var fileOPFlag="a+";
    fs.open(fileName,fileOPFlag,function(error,fd){
        var buffer;
        var remainder = null;
        fs.watchFile(fileName,{
            persistent: true,
            interval: 1000
        },function(curr, prev){
            // console.log('the current mtime is: ' + curr.mtime);
            // console.log('the previous mtime was: ' + prev.mtime);
            if(curr.mtime>prev.mtime){
                //文件内容有变化，那么通知相应的进程可以执行相关操作。例如读物文件写入数据库等
                continueReadData();
            }else{
                console.log('curr.mtime<=prev.mtime');
            }
       });
            
        //先读取原来文件中内容
        continueReadData();

        function continueReadData(){
            //var fileUpdateFlag=fileUpdateFlagIn;
            buffer=new Buffer(2048);
            var start = 0,i=0,tmp;
            fs.read(fd,buffer,0,buffer.length,null,function(err, bytesRead, buffer){

                var data=buffer.slice(0,bytesRead)
                if(remainder != null){//append newly received data chunk
                    console.log("remainder length:"+remainder.length);
                    tmp = new Buffer(remainder.length+bytesRead);
                    remainder.copy(tmp);
                    //data=buffer.slice(0,bytesRead);
                    data.copy(tmp,remainder.length)
                    data = tmp;
                }
                console.log("data length:"+data.length);
                for(i=0; i<data.length; i++){
                    if(newlines.indexOf(data[i]) >=0){ //\r \n new line
                        var line = data.slice(start,i);
                        self.emit("line", line);
                        start = i+1;
                    }
                }

                if(start<data.length){
                    remainder = data.slice(start);
                    if(remainder.toString()==='===END==='){
                        self.emit("end");
                        stopWatch();
                        return;
                    }
                }else{
                    remainder = null;
                }

                if(bytesRead<buffer.length){
                    return;
                }else{
                    //console.log('~~continue~~');
                    continueReadData();
                }
            });


        }

        function stopWatch(){
            fs.unwatchFile(fileName);
        }
    });

}

util.inherits(createLineReader, EventEmitter);

module.exports=createLineReader;