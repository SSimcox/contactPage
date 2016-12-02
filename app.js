/**
 * Created by Steven on 11/28/2016.
 */
var express = require('express');
var app = express();
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
var engine = require('ejs-mate');
var ejs = require('ejs');
var config = require('./config');

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('/views', __dirname + "/views");
app.use('/css', express.static('css'));
app.use(bodyParser.urlencoded({extended: false}));

var smtpTransport = nodemailer.createTransport("SMTP",{
    service:"Gmail",
    auth:{
        XOAuth2: {
            user: config.mailUser,
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            refreshToken: config.refreshToken
        }
    }
});

app.get('/',function(req,res,next){
   res.render('contact', {messageSent: false});
});

app.post('/', function(req,res,next){
    var mailOptions = {
        from: ''+config.mailUser+'', // sender address
        to: req.body.email, // list of receivers
        subject: req.body.subject, // Subject line
        text: req.body.content, // plaintext body
        // html: '<b>Hello world 🐴</b>' // html body
    };
    ejs.renderFile('./views/email.ejs',{subject:mailOptions.subject,content:mailOptions.text},function(err,str){
        mailOptions.html = str;
        smtpTransport.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
                return res.send(error);
            }
            return res.render('contact',{messageSent: true});
        });
    });
});

app.listen(3000,function(){
   console.log("Listening on port 3000");
});