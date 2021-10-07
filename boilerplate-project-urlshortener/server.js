require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mySecret = process.env['DB_KEY']
const urlparser = require('url');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });


const schema = new mongoose.Schema({
  url: 'string'
});
const Url = mongoose.model("Url", schema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post("/api/shorturl/", (req, res) => {
  console.log(req.body);
  const bodyurl = req.body.url;
  const lookup = dns.lookup(urlparser.parse(bodyurl).hostname, (error, address) => {
    if (!address) {
      res.json({
        error: "Invalid URL"
      });
    }
    else {
      const url = new Url({
        url: bodyurl
      });
      url.save((err, data) => {
        console.log(url);
        res.json({
          original_url: url.url,
          short_url: url.id
        });
      });
    }
  });
});

app.get("/api/shorturl/:id", (req, res) => {
  id = req.params.id;
  Url.findById(id, (err, data) => {
    console.log(data);
    if (!data) {
      res.json({
        error : "invalid url"
      })
    }
    else {
      res.redirect(data.url);
    }
  })
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
