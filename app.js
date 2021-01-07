const express = require('express');
const app = express();
const PORT= process.env.PORT || 3000;
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('connect-flash');

// routes
const indexRoute      = require("./routes/index");
const chat = require('./routes/chat');

//DB
let url = "mongodb://localhost:27017/SJ";
mongoose.connect(url,{useNewUrlParser: true});


// 뷰엔진 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// 기본 path를 /public으로 설정(css, javascript 등의 파일 사용을 위해)
app.use(express.static(__dirname + '/views'));

app.use(bodyParser.urlencoded({extended: true}));

const connectMongo = require('connect-mongo');
const MongoStore = connectMongo(session);

var sessionMiddleWare = session({
    secret:'LSJ', //세션 암호화 key
    resave:false,//세션 재저장 여부
    saveUninitialized:true,
    cookie:{
        maxAge:2000 * 60 * 60
    },//유효시간
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 14 * 24 * 60 * 60
    })
});
app.use(sessionMiddleWare)



var server = app.listen( PORT, function(){
    console.log('Express listening on port', PORT);
});

const listen = require('socket.io');
var io = listen(server);
io.use(function(socket, next){
    sessionMiddleWare(socket.request, socket.request.res, next);
 });
require('./libs/socketConnection')(io);



app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use('/chat', chat);
// use routes
app.use("/", indexRoute);