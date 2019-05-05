require('dotenv').config();
const express = require('express');
const app = express();
const layouts = require('express-ejs-layouts');

const MongoClient = require('mongodb').MongoClient;

const url = process.env.MONGODB_URI;

app.set('view engine', 'ejs');
app.use(layouts);
app.use('/', express.static('public'));

app.get('/main', async (req, res) => {
  //
  docs = await getDataFromMongo(0);
  const currentPage = 1;
  res.render('main', { docs, currentPage });
});

app.get('/main/:id', async (req, res) => {
  try {
    if (Number(req.params.id)) {
      const currentPage = Math.floor(req.params.id / 10) + 1;
      console.log(currentPage);
      docs = await getDataFromMongo(Number(req.params.id));

      return res.render('main', { docs, currentPage });
    } else {
      throw new Error('Parameter is not a number');
    } // what in the world is going on here james.....
  } catch (error) {
    console.log(error);
    res.redirect('/main');
  }
  res.send(docs);
});

app.get('/', (req, res) => {
  // res.sendFile(__dirname + '/index.html')
  res.render('index');
});

app.get('/api/:id', async (req, res) => {
  try {
    if (Number(req.params.id)) {
      doc = await getDataFromMongo(Number(req.params.id));

      return res.json({ data: doc });
    } else {
      throw new error('Parameter is not a number');
    }
  } catch (err) {
    console.log(err);
  }
});

const port = process.env.PORT || 3000;
var server = app.listen(port);
console.log(`Listening on port ${port}`);

module.exports = server;

async function getDataFromMongo(offset) {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db('spotdash');
    const col = db.collection('restaurants_by_need_full');

    return (docs = await col
      .find({ 'details.location.city': 'Seattle' })
      .sort({ need: -1 })
      .skip(offset)
      .limit(10)
      .toArray());
  } catch (error) {
    console.log(error);
  }
}
