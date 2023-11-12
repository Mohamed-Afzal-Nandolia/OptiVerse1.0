const express = require('express');
const session = require('express-session');
const mysql = require("mysql");
const qs = require("querystring");
const fs = require("fs");

const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "optiverse",
    port: 3307,
});

const app = express();

app.use(express.static('public')); // Add this line

app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: true,
}));

app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(__dirname + '/homepage.html');
    } else {
        res.sendFile(__dirname + '/loginpage.html');
    }
});

app.post('/', (req, res) => {
    let formdata = "";
    req.on("data", (chunk) => {
        formdata += chunk;
    });

    req.on("end", () => {
        const data = qs.parse(formdata);

        const query = "SELECT * FROM users WHERE email = ? AND password = ?";
        const values = [data.uemail, data.upass];

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(query, values, (err, result) => {
                connection.release();

                if (err) throw err;

                if (result.length > 0) {
                    req.session.loggedIn = true;
                    res.redirect('/');
                } else {
                    res.send("User is not registered");
                }
            });
        });
    });
});

app.listen(1200, () => {
    console.log("Server is listening on port 1200");
});