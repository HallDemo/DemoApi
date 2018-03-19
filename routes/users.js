var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
var Validator = require('validatorjs');

'use strict'
/* GET users listing. */
router.get('/get', function (req, res, next) {
  let db = new sqlite3.Database('./db/users.db', (err) => {
    if (err) {
      console.error(err.message);
    } else {
      let sql = 'SELECT * FROM users WHERE status = "Y"';
      db.all(sql, [], (err, rows) => {
        if (err) {
          throw err;
        } else {
          res.json(rows);
        }
      })
    }
  });
});

/* POST new user */
router.post('/create', function (req, res, next) {
  let db = new sqlite3.Database('./db/users.db', (err) => {
    if (err) {
      console.error(err.message);
      res.json("Unable to add new user");
    } else {
      var date = Date.now();
      let data = {
        forename: req.body.forename,
        surname: req.body.surname,
        email: req.body.email
      };
      
      let rules = {
        forename: 'required|string',
        surname: 'required|string',
        email: 'required|email'
      };
      
      let validation = new Validator(data, rules);
      
      validation.passes(function(){
        let sql = 'INSERT INTO users (email, forename, surname, created, status) VALUES (?, ?, ?, ?, ?)';
        db.all(sql, [req.body.email, req.body.forename, req.body.surname, date, "Y"], (err, result) => {
          if (err) {
            console.log(err);
            res.json("error creating user")
          } else {
            res.json("User created");
          }
        })
      }); // true
      validation.fails(function(){
        res.json("Validation Failed")
      }); // false
    }
  });
});

//Get specific user details
router.get('/get/:id', function (req, res, next) {
  let db = new sqlite3.Database('./db/users.db', (err) => {
    if (err) {
      console.error(err.message);
    } else {
      let sql = 'SELECT * FROM users WHERE id = ? AND status = "Y"';
      db.all(sql, [req.params.id], (err, rows) => {
        if (err) {
          console.log(err);
          res.json("error getting user details")
        } else {
          if (rows.length == 0){
            res.json("User doesn't exist")
          }else{
            res.json(rows);
          }
        }
      })
    }
  });
});

//Update specific user
router.post('/update/:id', function (req, res, next) {
  let db = new sqlite3.Database('./db/users.db', (err) => {
    if (err) {
      console.error(err.message);
    } else {
      let data = {
        forename: req.body.forename,
        surname: req.body.surname,
        email: req.body.email
      };
      
      let rules = {
        forename: 'required|string',
        surname: 'required|string',
        email: 'required|email'
      };
      
      let validation = new Validator(data, rules);

      validation.passes(function(){
        let sql = 'UPDATE users SET forename = ?, surname = ?, email = ?  WHERE id = ?';
        db.all(sql, [req.body.forename, req.body.surname, req.body.email, req.params.id], (err, rows) => {
          if (err) {
            console.log(err);
            res.json("error updating user")
          } else {
              res.json("data inserted");       
          }
        }) 
      }); // true
      validation.fails(function(){
        res.json("Validation Failed")
      }); // false
    }
  });
});

//Soft Delete specific user
router.post('/sdelete/:id', function (req, res, next) {
  let sql = 'UPDATE users SET status = "N" WHERE id = ?';
  db.all(sql, [req.params.id], (err, result) =>{
    if (err){
      console.log(err);
      res.json("error deleting user")
    }else{
      if (result[0].affectedrows == 0){
        res.json("No user matching the id given. Delete not carried out")
      }else{
        res.json("User deleted");
      }
    }
  })
});

//Hard Delete specific user
router.post('/hdelete/:id', function (req, res, next) {
  let sql = 'DELETE FROM users WHERE id = ?';
  db.all(sql, [req.params.id], (err, result) =>{
    if (err){
      console.log(err);
      res.json("error deleting user")
    }else{
      if (result[0].affectedrows == 0){
        res.json("No user matching the id given. Delete not carried out")
      }else{
        res.json("User deleted");
      }
    }
  })
});
module.exports = router;
