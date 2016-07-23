var express = require('express');
var ip = require('ip');
var app = new express();
app.use(express.static(__dirname + '/public'));
var server = require('http').createServer(app);
var io = require('socket.io')(server);


var sockets = [];

function emitOther(socket, msg, data) {
    for (var i = 0; i < sockets.length; i++) {
        if (sockets[i] != socket) {
            sockets[i].emit(msg, data);
        }
    }
};

io.on('connection', function (socket) {
    socket.on('ready', function () {
        var newId = 'user-' + Date.now();
        socket.userId = newId;
        socket.data = {userId: newId, x: Math.random() * 300, y: Math.random() * 300, vx: 0, vy: 0, time: Date.now()};
        console.log('new-user', socket.data);
        socket.emit('init', {
            data: socket.data,
            users: sockets.map(function (item) {
                var data = item.data;
                if (data && data.time && (data.vx || data.vy)) {
                    var time = Date.now() - data;
                    if (time) {
                        data.time = Date.now();
                        data.x += data.vx * time / 1000 / 60;
                        data.y += data.vy * time / 1000 / 60;
                    }
                }
                return data;
            })
        });
        sockets.push(socket);
        emitOther(socket, 'user-new', socket.data);
    });
    socket.on('move', function (data) {
        console.log('new-user', data);
        socket.data = data;
        data.userId = socket.userId;
        data.time = Date.now();
        emitOther(socket, 'user-move', data);
    });
    socket.on('disconnect', function () {
        console.log('discount', socket.data);
        io.emit('user' + socket.userId + ' disconnected');
        emitOther(socket, 'user-discount', socket.userId);
        sockets.splice(sockets.indexOf(socket), 1);
    });
});


server.listen(8000, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('start server at http://' + ip.address() + ':8000');
    }
});