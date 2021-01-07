require('./removeByValue')();
var userList = []; //사용자 리스트를 저장할곳
module.exports = function(io) {
    io.on('connection', function(socket){
        //아래 두줄로 passport의 req.user의 데이터에 접근한다.
        var session = socket.request.session.passport;
        var user = (typeof session !== 'undefined') ? ( session.user ) : "";

        // userList 필드에 사용자 명이 존재 하지 않으면 삽입
        if(userList.indexOf(user.name) === -1){
            userList.push(user.name);
        }
        io.emit('join', userList);

        socket.on('client message', function(data){
            io.emit('server message', { message : data.message, name : user.name });
        });
        socket.on('disconnect', function(){            
            userList.removeByValue(user.name);
            io.emit('leave', userList);
        });
    });
};