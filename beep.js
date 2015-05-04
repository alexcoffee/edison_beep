var http = require('http');
var url = require('url');
var querystring = require('querystring');
var m = require('mraa'); //require mraa
var fs = require('fs'); // to insert the html page


var pinSpeaker = new m.Gpio(0);
pinSpeaker.dir(m.DIR_OUT); //set the gpio direction to output

var server = http.createServer(function (req, res) {
    var params = querystring.parse(url.parse(req.url).query);
    var page = url.parse(req.url).pathname;

    console.log('GET : ' + page);

    if (page === '/beep') { // if you are in /change page get the argument (red, blue or green)
        res.writeHead(200);



        if ('d' in params) {

            console.log('params d = ' + params['d']);

            if (params['d'] > 2000) {
                params['d'] = 2000;
            }
            else if (params['d'] < 1) {
                params['d'] = 1;
            }

            beep(parseInt(params['d']));

            res.write('ok');
        }

        res.end();
    }

     // nowhere you are show the html page and dialog with socketio
    fs.readFile('./index.html', 'utf-8', function (error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });

});

function beep(duration)
{
    console.log('start beep');
    pinSpeaker.write(1);
    setTimeout(function(){
        pinSpeaker.write(0);
        console.log('stop beep');
    }, duration);
}

var io = require('socket.io').listen(server); // to dialog with the webpage

io.sockets.on('connection', function (socket) {

    socket.on('beep', function (value) {
        if (value > 2000) {
            value = 2000;
        }
        else if (value < 1) {
            value = 1;
        }
        console.log('beep from socket.io : ' + value);

        beep(parseInt(value));

    });
});

server.listen(8080);


