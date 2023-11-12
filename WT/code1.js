var http=require("http");
var mysql=require("mysql");
var qs=require("querystring");
var fs=require("fs");


var con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"company",
    port:3307
});//creating connection to mysql
var server=http.createServer((req,res)=>{
    var body="";
    if(req.method=='GET'){
        res.writeHead(200,{"Content-Type":"Html"})
        fs.createReadStream("register.html").pipe(res);
    }
    else if(req.method=='POST'){
        console.log("hello")
        var formdata="";
        req.on("data",(chunk)=>{
            formdata+=chunk;
            var data=qs.parse(formdata);//catching the key value pair
            body="\nName:"+data.uname+" Email: "+data.uemail+" Address: "+data.uadd+" Phone Number "+data.uphone+"\n";
            var contact=Number(data.uphone)
            con.connect((err)=>{
                console.log("err");
                if(err) throw err;
                console.log("Connection successful");
                var query="insert into employee values('"+data.uname+"','"+data.uemail+"','"+data.uadd+"',"+contact+");";
                con.query(query,function(err,result){
                    if(err) throw err;
                    console.log(result);
                });
            });
        });
    }
    req.on("end",()=>{
        res.writeHead(200,{"Content-Type":"text"});
        res.end(body);
    });
});
server.listen(5566);
