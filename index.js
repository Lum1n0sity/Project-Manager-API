const express = require('express');
const cors = require('cors');
const connection = require('./db');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/login', (req, res) => {
    const username_req = req.body.username;
    const password_req = req.body.password;


    let exists = false;

    connection.query('SELECT username, password, email FROM users WHERE username = ? AND password = ?', [username_req, password_req], (error, result) => {
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
            else
            {
                const storedHash = result[0].password;

                bcrypt.compare(password_req, storedHash, (err, result) => {
                    if (err)
                    {
                        console.error('Error comparing passwords:', err);
                        res.status(500).json({ error: 'Error comparing passwords' });
                    }
                    else
                    {
                        if (result) 
                        {
                            exists = true;
                            const selectedEmail = userdData.email;
                            res.json({ allowLogin: exists, email: selectedEmail });
                        }
                        else
                        {
                            res.status(401).json({ error: 'Invalid credentials' });
                        }
                    }
                });
            }
        }
    });
});

app.post('/api/create_account', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    let usernameexists = false;
    let passwordexists = false;
    let accountcreated = false;

    connection.query('SELECT * FROM users WHERE username = ?', [username], (error, result) => {
        if (error) 
        {
            console.error('Error executing MySQL query (/create_account(username query)): ' + error);
            res.status(500).json({ error: 'Error executing MySQL query' });
        } 
        else 
        {
            if (result.length === 0) 
            {
                usernameexists = false;
                console.log('username doesnt exist');

                connection.query('SELECT * FROM users WHERE password = ?', [password], (error, result) => {
                    if (error) 
                    {
                        console.error('Error executing MySQL query (/create_account(password query)): ' + error);
                        res.status(500).json({ error: 'Error executing MySQL query' })
                    } 
                    else 
                    {
                        if (result.length === 0) 
                        {
                            passwordexists = false;
                            console.log('password doesnt exist');

                            if (!usernameexists && !passwordexists) 
                            {
                                const saltRounds = 12;

                                bcrypt.hash(password, saltRounds, (err, hash) => {
                                    if (err) 
                                    {
                                      console.error('Error hashing password:', err);
                                    } else {
                                      

                                      connection.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hash, email], (error, result) => {
                                        if (error) 
                                        {
                                            console.error('Error inserting userdata into database: ' + error);
                                            res.status(500).json({ error: 'Error inserting userdata' });
                                        } 
                                        else 
                                        {
                                            accountcreated = true;
                                            res.json({ accountCreated: accountcreated });
                                        }
                                    });
                                    }
                                });
                                

                                
                            }
                        } else {
                            passwordexists = true;
                            console.log('password exists');
                            res.status(401).json({ error: 'Password Already Exists!' });
                        }
                    }
                });
            } else {
                usernameexists = true;
                console.log('username exists');
                res.status(401).json({ error: 'Username Already Exists!' });
            }
        }
    });
});

app.delete('/api/delete_user', (req, res) => {
    const username = req.body.username;

    connection.query('SELECT * FROM users WHERE username = ?', [username], (error, result) => {
      if (error) {
        console.error('Error executing MySQL query (/delete_account - SELECT): ' + error);
        res.status(500).json({ error: 'Error executing MySQL query' });
      } 
      else 
      {
        if (result.length === 0) 
        {
          res.json({ success: false, message: 'Account not found' });
        } 
        else 
        {
          const userId = result[0].id;

          connection.query('DELETE FROM users WHERE id = ?', [userId], (error, result) => {
            if (error) 
            {
              console.error('Error executing MySQL query (/delete_account - DELETE): ' + error);
              res.status(500).json({ error: 'Error executing MySQL query' });
            } 
            else 
            {
              res.json({ success: true, message: 'Account deleted successfully' });
            }
          });
        }
      }
    });
});

app.listen(PORT, () => {
    console.log('Server is running on port ${PORT}');
});