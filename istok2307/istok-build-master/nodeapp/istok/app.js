const path = require('path');
const express = require('express');
const querystring = require('querystring');
const app = express();
const dbapi = require('./app_modules/apiqueries');
const btapi = require('./app_modules/bitrixmtm');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const fs = require('fs');
const jade = require('jade');
const expressGoogleAnalytics = require('express-google-analytics');
 
// Insert your Google Analytics Id, Shoule be something like 'UA-12345678-9'
var analytics = expressGoogleAnalytics('UA-173917689-1');
const router = express.Router();
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'jade');
app.use(express.static('/uploads'));
app.use('/js', express.static(__dirname + '/scripts')); // my JS scripts
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/semantic-ui-css')); // redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/styles')); // redirect my CSS
app.use(favicon(path.join(__dirname, 'uploads', 'public', 'favicon.ico')));

app.use(bodyParser.text({
  defaultCharset: 'utf-8'
}));

app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: false
}));

app.use(bodyParser.json({
  limit: '50mb'
}));

app.use(analytics);

app.get('/ajax', function(req, res) {
  fs.readFile(path.join(__dirname, 'templates', 'ajax', req.query.file), 'utf8', function(err, data) {
    if (err) throw err;
    var fn = jade.compile(data);
    var html = fn({});
    res.send(html);
  });
});

app.get('/newitem', (req, res) => {
  res.render('newitem/main', {
    isEditing: "false"
  });
});

app.get('/edititem/:id', (req, res) => {
  res.render('newitem/main', {
    isEditing: "true"
  });
});

app.get('/brands', (req, res) => {
  res.render('brands/brand', {
    isEditing: "false"
  });
});

app.get('/editbrand/:id', (req, res) => {
  res.render('brands/brand', {
    isEditing: "true"
  });
});

app.get('/brands/add', (req, res) => {
  res.render('brands/add');
});

app.get('/items', (req, res) => {
  res.render('itemslist/items');
});

app.get('/search', (req, res) => {
  res.render('search/search');
});

app.get('/categories', (req, res) => {
  res.render('categories/items');
});

app.get('/secretImageAdding', (req, res) => {
  res.render('secrets/imagemanipulation');
});

app.get('/allproperties', (req, res) => {
  res.render('properties/items');
});

app.get('/cashdesk', (req, res) => {
  res.render('guests/mobilecashdesk/main');
});

app.get('/', (req, res) => {
  res.redirect('/items');
});

//API calls
app.get('/api', function(req, res, next) {
  res.status(200)
    .json({
      status: 'success',
      message: 'Masyanya TM API toys',
      currentApiVer: '1'
    });
});

//toys properties
app.get('/api/v1/properties', dbapi.getProperties);
app.post('/api/v1/properties/update/:id', dbapi.updatePropertie);
app.post('/api/v1/properties/add', dbapi.addPropertie);

//warehouse quantity
app.get('/api/v1/stockbalance', dbapi.stockbalance);
app.get('/api/v1/stockbalance/warehouse/:id', dbapi.stockbalanceByStockId);
app.get('/api/v1/stockbalance/item/:articul', dbapi.stockbalanceByItemarticul);

//warehouse incoming
app.post('/api/v1/stockincoming/upload', dbapi.stockIncoming);
app.get('/api/v1/stockincoming/:date', dbapi.stockIncomingByDate);
app.get('/api/v1/stockincoming/:partner/:date', dbapi.stockIncomingPartnerByDate);

//partners list
app.get('/api/v1/partners', dbapi.partnerslist);

//toys categories
app.get('/api/v1/categories', dbapi.getCategories);
app.post('/api/v1/categories/update/:id', dbapi.updateCategory);
app.post('/api/v1/categories/add', dbapi.addCategorie);

//toys
app.get('/api/v1/toys', dbapi.getAlltoys);
app.get('/api/v1/toys/count', dbapi.getCountAlltoys);
app.get('/api/v1/toys/:id', dbapi.getToyById);
app.get('/api/v1/toys/bycode/:code', dbapi.getToyByCode);
app.get('/api/v1/toys/bybarcode/:barcode', dbapi.getToyByBarCode);
app.get('/api/v1/toys/bybarcodeAnonim/:barcode', dbapi.getToyByBarCodeAnonim);
app.post('/api/v1/toys/add', dbapi.createToy);
app.post('/api/v1/toys/update/:id', dbapi.updateToy);
app.delete('/api/v1/toys/delete/:id', dbapi.removeToy);

//user route
app.post('/api/v1/user', dbapi.createUser);
app.post('/api/v1/login', dbapi.login);
app.get('/api/v1/user', dbapi.checkUser);

//brands
app.get('/api/v1/brands', dbapi.getBrands);
app.post('/api/v1/brands/update/:id', dbapi.updateBrand);
app.get('/api/v1/brands/:id', dbapi.getBrandsById);
app.post('/api/v1/brands/add', dbapi.createBrand);

//images manipulation
app.post('/api/v1/uploads', dbapi.upload);
app.post('/api/v1/uploads/balance', dbapi.uploadBalance);
app.post('/api/v1/uploads/sales', dbapi.uploadSales);
app.get('/api/v1/uploads/temp/:file', dbapi.getTempImage);
app.delete('/api/v1/uploads/temp/:file', dbapi.deleteTempImage);
app.get('/api/v1/uploads/fullsize/:file', dbapi.getFullImage);
app.get('/api/v1/images/:file', dbapi.getFullImage);
app.get('/api/v1/images/thumb/:file', dbapi.getThumbImage);

//additional info
app.get('/api/v1/colors', dbapi.getColors);
app.get('/api/v1/colors/:id', dbapi.getColorById);
app.post('/api/v1/packing', dbapi.addPacking);
app.get('/api/v1/packings', dbapi.getPackings);

//live searching data
app.get('/api/v1/livesearch', dbapi.getLiveSearhing);
app.get('/api/v1/searching', dbapi.getSearhing);
//contacts
app.post('/api/v1/contact/upload', dbapi.uploadContacts);

//bitrix24 calls
app.get('/bt/v1/user/:id', btapi.btGetUserById);
app.get('/bt/v1/user/', btapi.btGetUsers);
app.get('/bt/v1/contact/byphone/:phone', btapi.btGetContactByPhone);
app.get('/bt/v1/contact/add', btapi.btAddContact);
app.get('/bt/v1/contact/all', btapi.btGetAllContacts);
app.get('/bt/v1/item/all', btapi.btGetItems);
app.get('/bt/v1/item/byId/:id', btapi.btGetItemById);
app.get('/bt/v1/item/export', btapi.btExportContactsToBT);
app.get('/bt/v1/item/field/all', btapi.btGetFieldsList);
app.get('/bt/v1/item/testcreate', btapi.btCreateTestItem);

app.get('/api/v1/oldimages', dbapi.attachImagesToItem);

//server start
const server = app.listen(3000, function() {
  console.log('Istok development server started');
})