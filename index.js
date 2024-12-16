require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlsSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  id: {
    type: Number,
    required: true
  }
})
const Url = mongoose.model('Url',urlsSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:false}))
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function (req, res, next) {
  const originalURL = req.body.url;
  const urlObject = new URL(originalURL);
  dns.lookup(urlObject.hostname, async (err, address, family) => {
    if (err) {
      res.json({ error: 'invalid url' })
    } else {  
      let count = await countDocument() + 1
      let found = await findUrl(originalURL)
      if (found.length == 0) {
        createUrl({id:count,url:originalURL})
      }
      res.json({original_url:originalURL,short_url:count})
    }
  })
})
const countDocument = () => {
  return Url.countDocuments({}, function( err, count){
  })
}
const findUrl = (dataUrl) => {
  return Url.find({ url: dataUrl }, function (err, docs) {
  });
};
const findId = (dataId) => {
  return Url.find({ id: dataId }, function (err, docs) {
  });
};
const createUrl = (data) => {
  Url.create({ id: data.id, url: data.url }) 
  .then(result => { 
  })
}
app.get('/api/shorturl/:url', async function (req,res) {
  if (!isNaN(req.params.url)) {
    let found = await findId(req.params.url)
    if(found[0]) {
      res.redirect(found[0].url)
    } else {
      res.json({ error: 'invalid url' })
    } 
    return
  }
  res.json({ error: 'invalid url' })
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
