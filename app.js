const express = require ('express');
const dns = require ('dns');
const bodyParser = require ('body-parser');
const app = express();
const cors = require('cors');
const validUrl = require('valid-url');
const mongo= require ('mongodb')
const moongoose = require ('mongoose');
const { reset } = require('nodemon');
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
    

   if (!validUrl.isWebUri(url)) {
       return res.status(401).json ({
        error: 'invalid URL'
       })
   } else {
       try {
           let findOne = await URL.findOne({
               original_url: url
           });

            //vê se existe na db
           if (findOne) {
                res.json ({
                    original_url: findOne.original_url,
                    short_url: findOne.short_url
               })
           } else {
                urlCode++;
                findOne = new URL( {
                    original_url: url,
                    short_url:urlCode
                });

                await findOne.save();
                res.json({
                    original_url: findOne.original_url,
                    short_url: findOne.short_url
                })

           }
       }
       catch(err) {
           console.log (err);
           res.status(500).json('server error')
       }
   }
   

    // console.log (valid);
    // const test = dns.lookup(newURL,(err)=>{
    //     if (err) {
    //         return res.json({
    //             error: 'invalid URL'
    //         })
    //     }
    // })
    // console.log (test.hostname);

        // if (!newURL) {
        //     return res.json({
        //         error: 'invalid URL'
        //     })
        // } else {
        //     counter++;
        //     const newObj = {
        //         original_url: URL.original_url,
        //         shortUrl:`${counter}`
        //     }
        //     list.push (newObj)
        //     console.log (list)
        //     return res.json(newObj);
        // }

    // if (newURL === '') {
    //     return res.json({
    //         error: 'invalid url'
    //     })
    // } else {
    //     counter++;

    //     const newOb = {
    //         original_url: url,
    //         short_url: `${counter}`
    //     }
    //     list.push(newOb);
    //     console.log (list)
    //     return res.json(newOb)
    // }

})


app.get ('/api/shorturl/:id', async (req,res) => {
    const {id} = req.params;

    try {

        const findShort = await URL.findOne ({
            short_url: id
        })

        if (findShort) {
            res.redirect(findShort.original_url);
        } else {
            console.log ( findShort);
            res.status(404).json('No URL found');
        }

    } catch (e) {
        console.log (e)
        res.status(500).json('Server Error')
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
