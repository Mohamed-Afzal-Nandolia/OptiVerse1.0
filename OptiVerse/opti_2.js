const http = require("http");
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

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        res.writeHead(200, { "Content-Type": "text/html" });
        fs.createReadStream("loginpage.html").pipe(res);
    } else if (req.method === 'POST') {
        var formdata = "";
        req.on("data", (chunk) => {
            formdata += chunk;
        });

        req.on("end", () => {
            const data = qs.parse(formdata);

            // Hash the password before checking it against the database
            const hashedPassword = hashPassword(data.upass);

            // Use a prepared statement to avoid SQL injection
            const query = "SELECT * FROM users WHERE email = ? AND password = ?";
            const values = [data.uemail, hashedPassword];

            pool.getConnection((err, connection) => {
                if (err) throw err;

                connection.query(query, values, (err, result) => {
                    connection.release(); // Release the connection back to the pool

                    if (err) throw err;

                    if (result.length > 0) {
                        console.log("User is registered");
                        body = "User is registered";
                    } else {
                        console.log("User is not registered");
                        body = "User is not registered";
                    }

                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end(body);
                });
            });
        });
    }
});

function hashPassword(password) {
    // Use a proper hashing algorithm (e.g., bcrypt) in a production environment
    return password; // Placeholder, replace with a secure hash
}

server.listen(1200, () => {
    console.log("Server is listening on port 1200");
});