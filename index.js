require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const layouts = require('express-ejs-layouts');

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost/bikerackputter';

// // import geocoding services from mapbox sdk
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// // create a geocoding client
// const geocodingClient = mbxGeocoding({ accessToken: process.env.GEOCODING_CLIENT_ID })

app.set('view engine', 'ejs');
app.use(layouts);
app.use('/', express.static('public'));

app.get('/:id', async (req, res) => {
  //
  try {
    if (Number(req.params.id)) {
      console.log(req.params.id);
      docs = await getDataFromMongo(Number(req.params.id));
    } else {
      throw new Error('Parameter is not a number');
    }
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
  res.send(docs);
});

app.get('/', async (req, res) => {
  //
  docs = await getDataFromMongo(0);
  res.send(docs);
});

app.get('/', (req, res) => {
  // res.sendFile(__dirname + '/index.html')
  res.render('index');
});

app.get('/main', (req, res) => {
  // res.sendFile(__dirname + '/index.html')
  res.render('main');
});

app.post('/map', (req, res) => {
  // use the geocoding client to convert the city/location into coordinates
  geocodingClient
    .forwardGeocode({
      query: req.body.cityState,
      types: ['place'],
      countries: ['us'],
    })
    .send()
    .then(geoCodeObject => {
      var cityCenter = geoCodeObject.body.features[0];
      client
        .search({
          term: req.body.restaurantName,
          location: req.body.cityState,
        })
        .then(data => {
          var results = JSON.parse(data.body);
          var businesses = results.businesses; //JSON.parse(data.body.businesses) // an array of businessess
          var markers = businesses.map(r => {
            var markerObj = {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [r.coordinates.longitude, r.coordinates.latitude],
              },
              properties: {
                title: r.name,
                description:
                  "<img class='popupPic center' src=" +
                  r.image_url +
                  '><br><strong>' +
                  r.name +
                  '</strong><br>' +
                  r.display_phone +
                  '<br>' +
                  r.location.display_address +
                  "<br><form method='POST' action='/favorites/add'><input type='hidden' name='restaurantName' value='" +
                  r.name +
                  "'><input type='hidden' name='address1' value='" +
                  r.location.address1 +
                  "'><input type='hidden' name='address2' value='" +
                  r.location.address2 +
                  "'><input type='hidden' name='address3' value='" +
                  r.location.address3 +
                  "'><input type='hidden' name='city' value='" +
                  r.location.city +
                  "'><input type='hidden' name='state' value='" +
                  r.location.state +
                  "'><input type='hidden' name='zip' value='" +
                  r.location.zip +
                  "'><input type='hidden' name='country' value='" +
                  r.location.country +
                  "'><input type='hidden' name='phone' value='" +
                  r.display_phone +
                  "'><input type='hidden' name='lat' value='" +
                  r.coordinates.latitude +
                  "'><input type='hidden' name='long' value='" +
                  r.coordinates.longitude +
                  "'><input type='hidden' name='yelpRating' value='" +
                  r.rating +
                  "'><input type='hidden' name='imageURL' value='" +
                  r.image_url +
                  "'><input type='hidden' name='yelp_business_id' value='" +
                  r.id +
                  "'><button class='btn-floating halfway-fab waves-effect waves-light red' type='submit'><i class='material-icons'>add</i></button></form>",
                icon: 'restaurant',
              },
            };
            return JSON.stringify(markerObj);
          });
          res.render('home-results', {
            results: results,
            business: businesses,
            markers: markers,
            cityCenter: cityCenter,
          });
        })
        .catch(error => {
          console.log('ERROR!', error);
          res.render('error');
        });
    })
    .catch(error => {
      console.log('ERROR getting geocode', error);
      res.render('error');
    });
});

var server = app.listen(process.env.PORT || 3000);
module.exports = server;

async function getDataFromMongo(offset) {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db('bikerackputter');
    console.log('Connected to DB server');
    const col = db.collection('restaurants_by_need_full');
    return (docs = await col
      .find({})
      .skip(offset)
      .limit(10)
      .toArray());
  } catch (error) {
    res.send('something went wrong');
    console.log(error);
  }
}
