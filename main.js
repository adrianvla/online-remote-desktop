var http = require('http');
var url = require('url');
var fs = require('fs');
var crypto = require('crypto');
const preventSleep = require("node-prevent-sleep");
var users = [
    ['admin@morisinc.net', '1234'],
];
var colors = require('colors');
var position = {};
const {
    Server
} = require("socket.io");
const {
    access
} = require('fs/promises');
const {
    init
} = require('express/lib/application');
var robot = require('robotjs');
var oneuse = [];
var using = [];
var connections = [];
var sessionTimeout = {};
var sessionKey = {}; // FORMAT: Session:key
var sessionKeyCounter = {};

var useSecurity = false;

var myid = null;


const includesArray = (data, arr) => {
    return data.some(e => Array.isArray(e) && e.every((o, i) => Object.is(arr[i], o)));
}

preventSleep.enable();

var server = http.createServer(function (req, res) {

    var ur = req.url.replace('/', '').split('/');
    var u = req.url;
    if (req.method === "POST") {


        var body = "";
        req.on("data", function (chunk) {
            body += chunk;
        });

        req.on("end", function () {

            res.writeHead(200, {
                "Content-Type": "text/plain"
            });
            var decoded = JSON.parse(body);
            if (ur[0] == 'auth') {
                if (!includesArray(users, [decoded.u, decoded.p])) {
                    res.end(JSON.stringify({
                        p: false
                    }));
                } else {
                    var session = crypto.randomUUID();
                    var k = crypto.randomUUID();
                    sessionKey[session] = k;
                    sessionKeyCounter[session] = 0;
                    res.end(JSON.stringify({
                        p: true,
                        t: session,
                        k: k,
                        users: users
                    }));
                    oneuse.push(session);
                }
            } else if (ur[0] == 'ping') {

                //beacon
                //ping every 2s
                //timeout 10s
                //console.log(decoded.d, decoded.g);
                try {
                    if (sessionKey[decoded.d] && useSecurity) {
                        if (decoded.g == sessionKey[decoded.d].split('')[sessionKeyCounter[decoded.d] % sessionKey[decoded.d].split('').length]) {
                            (async function () {
                                clearInterval(sessionTimeout[decoded.d]);
                                sessionTimeout[decoded.d] = setTimeout(function () {
                                    delete using[using.indexOf(decoded.d)];
                                    using = using.filter(function (p) {
                                        return p != null;
                                    });
                                    console.log('SESSION '.yellow + decoded.d.cyan + ' has been disabled'.yellow);
                                    try {
                                        if (sessionKeyCounter[decoded.d]) {
                                            delete sessionKeyCounter[decoded.d];
                                        }
                                        if (sessionKey[decoded.d]) {
                                            delete sessionKey[decoded.d];
                                        }
                                    } catch (e) {
                                        console.log(e)
                                        console.log('78')
                                    }
                                }, 10000);

                                res.end(JSON.stringify({
                                    status: true,
                                    session: decoded.d
                                }));
                                sessionKeyCounter[decoded.d]++;
                            })();
                        } else {
                            console.log(89);
                            try {
                                delete using[using.indexOf(decoded.d)];
                                using = using.filter(function (p) {
                                    return p != null;
                                });
                                console.log('SESSION '.yellow + decoded.d.cyan + ' has been disabled'.yellow);
                                res.end(JSON.stringify({
                                    status: false
                                }));
                                try {

                                    if (sessionKeyCounter[decoded.d]) {
                                        delete sessionKeyCounter[decoded.d];
                                    }
                                    if (sessionKey[decoded.d]) {
                                        delete sessionKey[decoded.d];
                                    }
                                } catch (e) {
                                    console.log(e);
                                    console.log('102');
                                    res.end(0);

                                }
                            } catch (e) {
                                console.log(e);
                                console.log('89err');
                                res.end(0);
                            }

                        }
                    } else {
                        if(useSecurity){
                            res.end(JSON.stringify({
                                status: false
                            }))
                        }else{
                            res.end(JSON.stringify({
                                status: true,
                                session: decoded.d
                            }));
                        }
                    }

                } catch (e) {
                    console.log(e);
                    console.log(121);
                    res.end(0);
                }

            } else if (ur[0] == 'connect') {
                if (using.includes(decoded.d)) {
                    
                    res.end(JSON.stringify({
                        status: true,
                        p:myid
                    }))
                } else {
                    res.end(JSON.stringify({
                        status: false,
                        error: 'Not Authorized'
                    }));
                }
            }

        });
    }
    if (u == '/') {
        fs.readFile(__dirname + '\\gui\\password\\index.html', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }

            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write(data);
            res.end();
        });
    } else if (ur.length >= 2) {

        if (ur[0] == 'dashboard' && oneuse.includes(ur[1])) {
            fs.readFile(__dirname + '\\gui\\dashboard\\index.html', 'utf8', function (err, data) {
                if (err) {
                    res.writeHead(404, {
                        'Content-Type': 'text/plain'
                    });
                    res.write('An error occured: ' + err);
                    res.end();
                    return console.log(err);
                }

                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.write(data);
                res.end();
            });

            if(useSecurity){
                (async function () {
                    using.push(ur[1]);
                    sessionTimeout[ur[1]] = setTimeout(function () {
                        delete using[using.indexOf(ur[1])];
                        using = using.filter(function (p) {
                            return p != null;
                        });
                        console.log('SESSION '.yellow + ur[1].cyan + ' has been disabled'.yellow);
                        try {
    
                            if (sessionKeyCounter[decoded.d]) {
                                delete sessionKeyCounter[decoded.d];
                            }
                            if (sessionKey[decoded.d]) {
                                delete sessionKey[decoded.d];
                            }
                        } catch (e) {
                            console.log(e);
                            console.log('159')
                        }
                    }, 10000);
                    delete oneuse[oneuse.indexOf(ur[1])];
                    oneuse = oneuse.filter(function (p) {
                        return p != null;
                    });
                })();
            }

        } else {

            if ((ur[0] == 'dashboard' && ur[2] == 'style.css') || ur[0] == 'dashboard' && ur[1] == 'style.css') {
                fs.readFile(__dirname + '\\gui\\dashboard\\style.css', 'utf8', function (err, data) {
                    if (err) {
                        return console.log(err);
                    }

                    res.writeHead(200, {
                        'Content-Type': 'text/css'
                    });
                    res.write(data);
                    res.end();
                });
            } else if ((ur[0] == 'dashboard' && ur[2] == 'libs.min.js') || ur[0] == 'dashboard' && ur[1] == 'libs.min.js') {
                fs.readFile(__dirname + '\\gui\\libs.min.js', 'utf8', function (err, data) {
                    if (err) {
                        return console.log(err);
                    }

                    res.writeHead(200, {
                        'Content-Type': 'text/javascript'
                    });
                    res.write(data);
                    res.end();
                });
            } else {

                res.writeHead(401, {
                    'Content-Type': 'text/plain'
                });
                res.write('Unauthorized');
                res.end();
            }
        }
    }
});
const {
    ensureConnection
} = require('./ngrok');
const {
    exec
} = require("child_process");
var opn = require('opn');
const port = process.env.PORT || 80;
(async function () {
    await ensureConnection(url => {
        console.log(`Listening to ${url}`);
        coolUrl = url;
        //opn('http://localhost:1337');
    });
})();

var coolUrl = '';
const io = new Server(server);
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('control', (msg) => {
        if(using.includes(msg.d)){
            switch(msg.data.packet){
                case "mouse":
                    mouseDownUp(msg.data.which,msg.data.mouse);
                    break;
                case "key":
                    keyDownUp(msg.data.key,msg.data.keyDown);
                    break;
                case "wheel":
                    robot.scrollMouse(msg.data.wheel[0],msg.data.wheel[1]);
                    break;
                case "deltaMouse":
                    deltaMouse(msg.data.deltaMouse[0],msg.data.deltaMouse[1]);
                    break;
            }
        }
    });
});

server.listen(80);
function mouseDownUp(w,is){
    var btn = "";
    if(w==1){
        btn="left";
    }else if(w==2){
        btn="middle";
    }else if(w==3){
        btn="right";
    }
    robot.mouseToggle(is ? "down" : "up",btn);
    
}
function keyDownUp(w,is){
    try{
        var btn = w.toLowerCase().replaceAll('key','').replaceAll('left','').replaceAll('right','').replaceAll('digit','').replaceAll('period','.').replaceAll('semi-colon',';').replaceAll('equal sign','=').replaceAll('comma',',').replaceAll('dash','-').replaceAll('forward slash','/').replaceAll('Backquote','`').replaceAll('open bracket','[').replaceAll('back slash','\\').replaceAll('close bracket',']').replaceAll('single quote',"'");
        console.log(is ? "down" : "up",btn);
        robot.keyToggle(btn,is ? "down" : "up");
    }catch(e){console.log(e)}
    
}
function deltaMouse(x,y){
    var mpos = robot.getMousePos();
    robot.moveMouse(mpos.x+x,mpos.y+y);
}



/*
robot.setMouseDelay(0.5);

var twoPI = Math.PI * 2.0;
var screenSize = robot.getScreenSize();
var height = (screenSize.height / 2) - 10;
var width = screenSize.width;

for (var x = 0; x < width; x++)
{
	y = height * Math.sin((twoPI * x) / width) + height;
	robot.moveMouse(x, y);
}*/



var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
var ap = http.createServer(function (req, res) {

    var ur = req.url.replace('/', '').split('/');
    var u = req.url;
    if (req.method === "POST") {


        var body = "";
        req.on("data", function (chunk) {
            body += chunk;
        });

        req.on("end", function () {

            res.writeHead(200, {
                "Content-Type": "text/plain"
            });
            var decoded = JSON.parse(body);
            if(decoded.why=='id') myid = decoded.p;
            console.log(myid);
            res.end();
        });
    }
    if (u == '/') {
        fs.readFile(__dirname + '\\gui\\controlpanel\\index.html', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
    
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write(data);
            res.end();
        });
    } 
});

ap.listen(1337);

var CLI = require('clui'),
    Spinner = CLI.Spinner;
const wait = () => setTimeout(wait, 1000); // Loop to keep the process alive

process.on('SIGINT', () => {
    var countdown = new Spinner('Exiting in 3 seconds...  ');
    countdown.start();
    var n = 3;
    preventSleep.disable();
    setInterval(function () {
        n--;

        countdown.message('Exiting in ' + n + ' seconds...  ');
        if (n == 0) {
            process.stdout.write('\n');
            process.exit(0);
        }
    }, 1000);
});

wait();