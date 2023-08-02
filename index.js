const express = require('express');
const cors = require('cors');
const connection = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/login', (req, res) => {
    const username = req.query.username;
    const password = req.query.password;

    let exists = false;

    connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (error) => {
        if (error)
        {
            console.error('Error executing MySQL query: ', error);
            res.status(500).json({ error: 'Error executing MySQL query' });
        }
        else 
        {
            exists = true;
            res.json({ allowLogin: exists });
        }
    });
});

app.post('/api/create_account', (req, res) => {

});

app.listen(PORT, () => {
    console.log('Server is running on port ${PORT}');
});