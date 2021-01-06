const express = require("express");
const router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require("crypto");
var user_name = "";


router.get('/', (req, res) => res.render('index', {name : user_name}));
router.get("/login", (req, res) => res.render("login", {page: "login", message:req.flash('login_message')}));
router.get("/signup", (req, res) => res.render("signup", {page: "signup"}));
router.get('/logout', function (req, res) {
    req.logout();
    user_name = ""; // 이름 변수 초기화
    res.redirect('/'); //로그아웃 후 '/'로 이동
});

router.post("/signup", (req, res, next) => {
    console.log(req.body);
    
    User.find({ id:req.body.id })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                res.send('<script type="text/javascript">alert("이미 존재하는 아이디입니다."); window.location="/signup"; </script>');
            } else {
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    name:req.body.name,
                    id: req.body.id,
                    password: crypto.createHash('sha512').update(req.body.password).digest('base64')
                });
                user
                    .save()
                    .then(result => {
                        console.log(result);
                        res.redirect("/");
                    })
                    .catch(err => {
                        console.log(err);
                    });
                  }
        });
});

//로그인에 성공할 시 사용자 정보를 세션에 저장
passport.serializeUser(function (user, done) {
    done(null, user);
});

//사용자 인증 후 요청이 있을 때마다 호출
passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField : 'password',
    passReqToCallback : true//request callback 여부
},
function (req, id, password, done)
{
    User.findOne({id: id, password: crypto.createHash('sha512').update(password).digest('base64')}, function(err, user){
        if (err) {
            throw err;
        } else if (!user) {
            return done(null, false, req.flash('login_message','아이디 또는 비밀번호를 확인하세요.')); // 로그인 실패
        } else {
            user_name = user.name; // 로그인 성공 시 해당 이름 변수 저장
            return done(null, user); // 로그인 성공
        }
    });
}
));


router.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureFlash: true}), // 인증 실패 시 '/login'으로 이동
    function (req, res) {
        
        res.send('<script type="text/javascript">alert("로그인 성공"); window.location="/"; </script>');
        //로그인 성공 시 '/'으로 이동
    });


module.exports = router;