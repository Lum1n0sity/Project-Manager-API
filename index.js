const express = require('express');
const cors = require('cors');
const connection = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/login', (req, res) => {
    const username_req = req.body.username;
    const password_req = req.body.password;

    console.log('sent username', username_req);
    console.log('sent password', password_req); 

    let exists = false;

    connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username_req, password_req], (error, result) => {
        if (error)
        {
            console.error('Error executing MySQL query (/login): ', error);
            res.status(500).json({ error: 'Error executing MySQL query' });
        }
        else 
        {
            if (result.length === 0)
            {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const userdData = result[0];
            if (password_req === userdData.password && username_req === userdData.username)
            {  
                console.log('login');
                exists = true;
                res.json({ allowLogin: exists });
            }
        }
    });
});

app.post('/api/create_account', (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    const email = req.query.email;

    let usernameexists = false;
    let passwordexists = false;
    let accountcreated = false;

    connection.query('SELECT + FROM users WHERE username = ?', [username], (error) => {
        if (error)
        {
            console.error('Error executing MySQL query (/create_account(username query)): ' + error);
            res.status(500).json({ error: 'Error executing MySQL query' });
        }
        else 
        {
            usernameexists = true;
            res.json({ usernameExists: usernameexists });
        }
    });

    connection.query('SELECT * FROM users WHERE password = ?', [password], (error) => {
        if (error)
        {
            console.error('Error executing MySQL query (/create_account(password query)): ' + error);
            res.status(500).json({ error: 'Error executing MySQL query' })
        }
        else 
        {
            passwordexists = true;
            res.json({ passwordExists: passwordexists });
        }
    });

    if (!usernameexists && !passwordexists)
    {
        connection.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)' [username, password, email], (error, result) => {
            if (error)
            {
                console.error('Error inserting userdata into database: ' + error);
                res.status(500).json({ error: 'Error inserting userdata' });
            }
            else
            {
                res.json({ accountCreated: accountcreated });
            }
        });
    }
});

app.listen(PORT, () => {
    console.log('Server is running on port ${PORT}');
});