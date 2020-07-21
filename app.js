var express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	mysql = require("mysql"),
	session = require('express-session'),
	cookieParser = require('cookie-parser'),
	morgan = require('morgan'),
	passport = require('passport'),
	flash = require('connect-flash'),
	mysql = require("mysql");

var port     = process.env.PORT || 3000;

require('./config/passport')(passport);

app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));


app.use(session({
	secret: 'workindia',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect("/");

}

const Cryptr = require('cryptr');
const cryptr = new Cryptr('workindia');

 
// const encryptedString = cryptr.encrypt('bacon');
// const decryptedString = cryptr.decrypt(encryptedString);
 
// console.log(encryptedString); 
// console.log(decryptedString); 








var con = mysql.createConnection({
	  host: "localhost",
	  user: "abcd",
	  password: "12345",
	  database: "workindia",
	  port: 3306,
	});


con.connect(function(err) {
	  if (err) throw err;
	  console.log("Connected!");
});




app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
});


app.get('/login', function(req, res) {

	// render the page and pass in any flash data if it exists
	res.render('login.ejs', { message: req.flash('loginMessage') });
});


app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/home', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
           
    });



app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

// process the signup form
app.post('/signup', passport.authenticate('local-signup', {
	successRedirect : '/home', // redirect to the secure profile section
	failureRedirect : '/signup', // redirect back to the signup page if there is an error
	failureFlash : true // allow flash messages
}));

app.get("/addsite", isLoggedIn, function(req, res){
	res.render("addsite");
});

app.post("/addsite", function(req, res){
	var sql = "INSERT INTO `site` (`uid`, `pwd`, `username`, `site`)VALUES (?,?,?,?);";
	var newpwd = encryptedString = cryptr.encrypt(req.body.pwd);

// const encryptedString = cryptr.encrypt('bacon');
// const decryptedString = cryptr.decrypt(encryptedString);
 

	con.query(sql,[req.user.username,newpwd,req.body.uname,req.body.site], function(err, result){
		if(err){console.log(err);}
		else
		{
			console.log("DONE");
			res.redirect("/home");
		}
	});

	// console.log(req.body);
	// console.log(req.user);


});




app.get('/home', isLoggedIn, function(req, res) {

	var sql = "Select * from site where uid=?";
	con.query(sql,req.user.username, function(err, result)
	{
		// result.forEach(function(itr)
		// {
			
		// 	var ivstring = iv.toString(itr.pwd).slice(0, 16);
		// 	var x=cryptr.decrypt(toString(ivstring));
		// 	itr.pwd=x;
		// });
		

		res.render('home.ejs', {
				user : req.user, // get the user out of session and pass to template
				list : result
			});
			console.log("at home");
	});
});


app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
});





app.get("*", function(req,res){
	res.send(" <div><div align=center>You didn't get what you are looking for...!!!</div><br> Error 404 - Webpage Not Found </div></div> ");

});


app.listen(port, function(){
	console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", port, port);
});