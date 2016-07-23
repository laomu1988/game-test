var socket = io(); // TIP: io() with no args does auto-discovery
var ready = false, users = [];
socket.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
    socket.emit('ready');
    ready = true;
    socket.on('init', function (data) {
        console.log('init:', data);
        if (!data) {
            return;
        }
        if (data.data) {
            main_state.createSelf(data.data);
        }
        if (data.users && data.users.length > 0) {
            for (var i = 0; i < data.users.length; i++) {
                main_state.updateUser(data.users[i]);
            }
        }
    });
    socket.on('user-new', function (data) {
        console.log('user-new:', data);
        main_state.updateUser(data);
    });
    socket.on('user-move', function (data) {
        console.log('user-move:', data);
        main_state.updateUser(data);
    });
    socket.on('user-discount', function (userId) {
        main_state.destory(userId);
    });
});

window.send = function (msg, data) {
    if (!ready || !msg) {
        console.log('send msg not called: ', msg, data);
        return;
    }
    socket.emit(msg, data);
};