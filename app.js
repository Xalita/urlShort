const express = require ('express');
const dns = require ('dns');
const bodyParser = require ('body-parser');
const app = express();
const cors = require('cors');

// Basic Configuration

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use (bodyParser.json());

app.use('/public', express.static(`${__dirname}/public`));

app.get('/', function(req, res) {
  res.sendFile(__dirname+ '/views/index.html');
});

let list = [];
let counter = 0;


app.post ('/api/shorturl', (req,res,next)=> {

    let {url} = req.body;
    let newURL = url.replace(/^https?:\/\//,'');
    if (newURL === '') {
        return res.json({
            error: 'invalid url'
        })
    } else {
        counter++;

        const newOb = {
            original_url: url,
            short_url: `${counter}`
        }
        list.push(newOb);
        console.log (list)
        return res.json(newOb)
    }

})


app.get ('/api/shorturl/:id',(req,res)=> {

        const {id} = req.params;

        const shortUrl = list.find(l=> l.short_url === id);
        console.log (shortUrl);
        console.log (list);

        return res.redirect(shortUrl.original_url);


})






module.exports= app;
