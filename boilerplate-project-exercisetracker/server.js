const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mySecret = process.env['DB_KEY'];
const mongoose = require('mongoose');
const { Schema } = mongoose;
const bodyParser = require('body-parser');

// Configuration 
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });

// Schemas 
const userSchema = new Schema({
  username : {
    type : String, 
    required : true
  }
});

const exSchema = new Schema({

  userID : {
    type : String, 
    required : true
  },
  description : {
    type : String, 
    required : true
  },
  duration : {
    type : Number, 
    required : true
  },
  date : {
    type : Date, 
    required: true
  }

});

const User = mongoose.model("User", userSchema);
const Ex = mongoose.model("Ex", exSchema);

// Create and save a new user 
app.post("/api/users", (req, res) => {
  const newUser = new User({username : req.body.username}, (err, data) => {
    if (err) return console.log(err);
  });
  newUser.save((err, data) => {
    if (err) return console.log(err);
    res.json({
      username : data.username,
      _id : data["_id"]
    });
  });
});

// Get all users
app.get("/api/users", (req, res) => {
  User.find({}, (err, data) => {
    if (err) return console.log(err);
    res.json(data);
  });
});

// Create and save new exercises
app.post("/api/users/:_id/exercises", (req, res) => {
  const userID = req.params["_id"];
  const {description, duration} = req.body;
  var dateStr = (req.body.date) ? new Date(req.body.date) : new Date();
  User.findById(userID, (err, data) => {
    if (err) {
      return console.log(err);
    }

    // If no user found, send and quit
    else if(!data) {
      res.send("not found");
    }

    // If user found, save exercise and send
    else {
      const newEx = new Ex({
        userID : userID,
        description : description,
        duration : duration,
        date : dateStr
      });
      newEx.save((err, exdata) => {
        if (err) console.log(err);
        res.json({
          _id : data["_id"],
          username : data.username,
          date : dateStr.toDateString(),
          duration : exdata.duration,
          description : exdata.description
        });
      }); 
    }
  });
});

// Retrieve user logs, using params if included 
app.get("/api/users/:_id/logs", (req, res) => {
  const exID = req.params["_id"]
  const {from, to, limit} = req.query;
  console.log(`From : ${from}`);
  console.log(`To : ${to}`);
  console.log(`Limit : ${limit}`)
  User.findById(req.params["_id"], (err, userData) => {
    if (err) {
      return console.log(err);
    }
    
    else if(!userData) {
      res.send("not found");
    }

    else {
      // This is extremely stupid sorry 
      // Research how to use operators only if they exist?

      if (to && from) {
        console.log("to, from");
        Ex.find({userID : exID, date : {$gte : new Date(from)}, date : {$lte :new Date(to)}})
        .exec((err, exData) => {
          if (err) return console.log(err);
          const formArr = exData.map(e => {
            return {
              description : e.description,
              duration : e.duration,
              date : e.date.toDateString()
            }
          });
          res.json({
            _id : exID, 
            username : userData.username,
            count : exData.length,
            log : formArr
          });
        })
      }

      else if (limit) {
        console.log("limit");
        Ex.find({userID : exID})
        .limit(parseInt(limit, 10))
        .exec((err, exData) => {
          if (err) return console.log(err);
          const formArr = exData.map(e => {
            return {
              description : e.description,
              duration : e.duration,
              date : e.date.toDateString()
            }
          });
          res.json({
            _id : exID, 
            username : userData.username,
            count : exData.length,
            log : formArr
          });
        })
      }

      else {
        console.log("no limits or dates");
        Ex.find({userID : exID})
        .exec((err, exData) => {
          if (err) return console.log(err);
          const formArr = exData.map(e => {
            return {
              description : e.description,
              duration : e.duration,
              date : e.date.toDateString()
            }
          });
          res.json({
            _id : exID, 
            username : userData.username,
            count : exData.length,
            log : formArr
          });
        })
      }
    }
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
