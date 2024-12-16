require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

const short_url_arr=[]

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

app.post('/api/shorturl', (req, res, next) => {
  const originalURL = req.body.url;
  const urlObject = new URL(originalURL);
  dns.lookup(urlObject.hostname, (err, address, family) => {
    if(err) {
      res.json({ error: 'invalid url' })
      return;
    } 
    short_url_arr.push(req.body.url)
    res.json({original_url:req.body.url,short_url:short_url_arr.length})
  })
})

app.get('/api/shorturl/:url',(req,res)=>{
  if (!isNaN(req.params.url)) {
    const index =  parseInt(req.params.url)
    const redirectToUrl = short_url_arr[index-1]
    if (redirectToUrl) {
      res.redirect(redirectToUrl); 
      return;
    }
  }
  res.json({ error: 'invalid url' })
 
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
