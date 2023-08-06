const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1 (alternativ your server ip or domain)',
    user: 'mysql_user',
    password: 'password',
    database: 'database_name'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
});

module.exports = connection;
