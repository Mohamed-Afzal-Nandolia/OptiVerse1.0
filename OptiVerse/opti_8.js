//first
const express = require('express');
const session = require('express-session');
const mysql = require("mysql");
const qs = require("querystring");
const fs = require("fs");
//second
const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "optiverse",
    port: 3307,
});
//third
var app = express();

//this will make all the public folder files static, so we dont have to use the app.get() for forgotpassword and terms and conditions.
app.use(express.static('public')); 

//fourth
app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: true,
}));

//sixth
app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(__dirname + '/homepage.html');
    } else {
        res.sendFile(__dirname + '/loginpage.html');
    }
});
app.get('/post', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(__dirname + '/post.html');
    } else {
        res.redirect('/');
    }
});
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/loginpage.html');
    });
});
app.get('/loginpage.html', (req, res) => {
    res.sendFile(__dirname + '/loginpage.html');
});

/* Because we have use app.use(express.static('public')); this will make all the public folder files static,
so we dont have to use the app.get() for forgotpassword and terms and conditions.
app.get('/forgotpassword.html', (req, res) => {
    res.sendFile(__dirname + '/forgotpassword.html');
});
*/

// fifth, routes
app.post('/', (req, res) => {
    let formdata = "";
    req.on("data", (chunk) => {
        formdata += chunk;
    });

    req.on("end", () => {
        const data = qs.parse(formdata);

        const query = "SELECT * FROM users WHERE email = ? AND password = ?";
        const values = [data.uemail, data.upass];
        req.session.usermail = data.uemail;

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(query, values, (err, result) => {
                connection.release();   

                if (err) throw err;

                if (result.length > 0) {
                    req.session.loggedIn = true;
                    res.redirect('/');//to sixth
                } else {
                    res.send("User is not registered");
                }
            });
        });
    });
});
// fifth, routes
app.post('/post-thought', (req, res) => {
    let formdata = "";
    req.on("data", (chunk) => {
        formdata += chunk;
    });

    req.on("end", () => {
        const data = qs.parse(formdata);

        const query = "INSERT INTO userposts (username, post) VALUES (?, ?)";
        const values = [req.session.usermail, data.thought]; // replace 'req.session.username' with the actual username

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(query, values, (err, result) => {
                connection.release();

                if (err) throw err;

                res.redirect('/');
            });
        });
    });
});
app.post('/register', (req, res) => {
    let formdata = "";
    req.on("data", (chunk) => {
        formdata += chunk;
    });

    req.on("end", () => {
        const data = qs.parse(formdata);

        const query = "INSERT INTO users (email, password) VALUES (?, ?)";
        const values = [data.email, data.password]; // Note: This is not secure for production

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(query, values, (err, result) => {
                connection.release();

                if (err) throw err;

                res.redirect('/');
            });
        });
    });
});
// sixth
app.listen(1200, () => {
    console.log("Server is listening on port 1200");
});
