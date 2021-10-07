// server.js
// init project
var express = require('express');
var app = express();
//var bodyParser = require('body-parser')
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// Endpoints 
app.get("/api", (req, res) => {
  res.json({
    unix : new Date().valueOf(),
    utc : new Date().toUTCString()
  })
}); 

app.get("/api/:date", (req, res) => {
  timestamp = req.params.date;
  console.log(timestamp);
  dashReg = /[0-9]+-/g;
  numReg = /[0-9]+/;
  letterReg = /[0-9]+\s[a-z]+\s[0-9]+/i;

  // Handle different date formats 
  if (timestamp.match(letterReg)) {
    console.log("longform");
    dateObj = new Date(timestamp);
    res.json({
      unix : dateObj.valueOf(),
      utc : dateObj.toUTCString()
    })
  }

  else if (timestamp.match(dashReg)) {
    console.log("dashes");
    dateObj = new Date(timestamp);
    res.json({
      unix : dateObj.valueOf(),
      utc : dateObj.toUTCString()
    })
  }

  else if (timestamp.match(numReg)) {
    console.log("numbers")
    x = parseInt(timestamp, 10);
    console.log(x + "(formatted)");
    dateObj = new Date(x);
    res.json({
      unix : dateObj.valueOf(),
      utc : dateObj.toUTCString()
    })
  }

  else {
    res.json({
      error: "Invalid Date"
    })
  }
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
