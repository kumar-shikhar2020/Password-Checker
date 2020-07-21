// config/passport.js

var LocalStrategy   = require('passport-local').Strategy;


var mysql = require('mysql');
var bcrypt = require('bcryptjs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);
//connection.connect();
connection.query('USE ' + dbconfig.database);
//connection.end();

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        //connection.connect();
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
        //connection.end();
    });

    passport.use(
        'local-signup',
        new LocalStrategy({
           
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, username, password, done) {
           
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    // create the user
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, 10) 
                    };

                    var insertQuery = "INSERT INTO users ( username, password ) values (?,?)";
                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                    //connection.end();
                }
            });
            //connection.end();
        })
    );

    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, username, password, done) { 
            //connection.connect();
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, rows[0]);
            });
            //connection.end();
        })
    );
};
