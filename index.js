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

    let username_correct = false;
    console.log(username_req);

    let exists = false;

    connection.query('SELECT username, password, email FROM users WHERE username = ?', [username_req], (error, result) => {
        if (error)
        {
            console.error('Error executing MySQL query (/login): ', error);
            res.status(500).json({ error: 'Error executing MySQL query' });
        }
        else 
        {
            const query_data = result[0];

            if (query_data.username === username_req)
            {
                username_correct = true;
            }
            else
            {
                username_correct = false;
            }

            if (result.length === 0)
            {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            else
            {
                bcrypt.compare(password_req, query_data.password, function(err, result) {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  console.log(result);
                  if (result) 
                  {
                    if (username_correct)
                    {
                      exists = true;
                      res.json({ allowLogin: exists, email: query_data.email });
                    }
                  } 
                  else 
                  {
                    exists = false;
                    res.status(401).json({ error: 'Invalid credentials' });
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

    const saltRounds = 12;

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

                connection.query('SELECT * FROM users', (error, result) => {
                    if (error) 
                    {
                        console.error('Error executing MySQL query (/create_account(password query)): ' + error);
                        res.status(500).json({ error: 'Error executing MySQL query' })
                    } 
                    else 
                    {
                        const query_data_cr = result[0];

                        bcrypt.compare(password, query_data_cr.password, function(err, result) {
                          if (error)
                          {
                            console.log(err);
                            return;
                          }
                          if (!result)
                          {
                            passwordexists = false;

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
                          else
                          {
                            console.log('Create Account Compare: ', result);
                            console.log('Password Already Exists!');
                            passwordexists = true;
                            res.status(401).json({ error: 'Password Already Exists!' });
                          }
                        }); 
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