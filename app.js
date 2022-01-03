const express = require ('express');
const dns = require ('dns');
const bodyParser = require ('body-parser');
const urlParser = require ('url')
const app = express();
const cors = require('cors');
const moongoose = require ('mongoose');
const { reset } = require('nodemon');
const { Db } = require('mongodb');
const DB = process.env.DB
// Basic Configuration
moongoose.connect('mongodb+srv://bruno:sarapita88@cluster0.5jn5b.mongodb.net/freeCode?retryWrites=true&w=majority', {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
}) .then (()=> console.log ('Connected'))
    .catch( e => console.log ('error',e))

const {Schema} = moongoose;

const urlSchema = new Schema({
    original_url: String,
    short_url: String
})

const URL = moongoose.model('URL', urlSchema);

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use (bodyParser.json());

app.use('/public', express.static(`${__dirname}/public`));

app.get('/', function(req, res) {
  res.sendFile(__dirname+ '/views/index.html');
});

// let list = [];

// let counter = URL.short_url;

let urlCode = 0;

app.post ('/api/shorturl', async (req,res,next)=> {

    let {url} = req.body;
    console.log (typeof URL);
    const lookup = dns.lookup(urlParser.parse(url).hostname,async (err,address) => {
        if (!address) {
            res.json({
                error: 'invalid URL'
            })
        } else {
            try {
                let findOne = await URL.findOne( {
                    original_url: url
                });


                if (findOne) {
                    res.json({
                        original_url: findOne.original_url,
                        short_url: findOne.short_url
                    })
                } else {

                   
                    // let lastShortNumber = URL.findOne(data => data.short_url);
                    // console.log ('LastShortNumber: ',lastShortNumber);
                    findOne = new URL ( {
                        original_url: url,
                        short_url: `${urlCode}`
                    });

                    findOne.save();
                    res.json({
                        original_url: url,
                        short_url: findOne.short_url
                    })

                }
                 
            }
            catch(e) {
                console.log ('error: ', e)
            }
        }
    })
    

   console.log ('lookup: ',lookup)
   


})


app.get ('/api/shorturl/:id', async (req,res) => {

    const {id} = req.params;

    try {

        let findShort = await URL.findOne({
            short_url: id
        })

        console.log (findShort.original_url);
        console.log (id)

        if (findShort) {
            res.redirect(findShort.original_url);

        } else {
            res.status(404).json('Not Found')

        }

    }
    catch (e) {
        console.log ('error: ', e)
    }


})


app.delete('/api/shorturl/:id', async (req,res) => {
    const {id} = req.params;

    try {
        let findId = await URL.findOne({
            short_url: id
        })

        if (findId) {
            findId.delete();
            res.json(`Sucess`)
        }
    }
    catch (e) {
        console.log (e);
        reset.status(500).json('Cannot Delet')
    }
})


// const {id} = req.params;

// const shortUrl = list.find(l=> l.short_url === id);
// console.log (shortUrl);
// console.log (list);

// return res.redirect(shortUrl.original_url);


module.exports= app;
