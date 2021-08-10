const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const path = require ('path');
const dbapi = require('./api');
const updateScheduler = require('./synchroid/scheduler');
const https = require("https");
const fs = require("fs");
const { graphqlHTTP } = require('express-graphql');
const graphql = require('graphql');
const { query } = require('./gqlenv/queries');
const { mutation } = require('./gqlenv/mutation');

const httpsOptions = {
  key: fs.readFileSync('secrets/private-key.pem'),
  cert: fs.readFileSync('secrets/public-certificate.pem'),
};

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

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.listen(3000);
https.createServer(httpsOptions, app).listen(8443);

console.log('*** App OnLine ***');

app.get('/api', function(req, res, next) { //test api ask
  res.status(200)
    .json({
      status: 'success',
      message: 'Welcome to Masyanya Toy Shop API, use path with a version ex.: host/api/v1/',
      currentApiVer: '1'
    });
});

app.get('/api/v1', function(req, res, next) { //test api ask
res.status(200)
  .json({
  status: 'success',
  message: 'Masyanya Toy Shop API',
  currentApiVer: '1'
  });
}); 


const QueryRoot = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    hello: {
      type: graphql.GraphQLString,
      resolve: () => "Hello world!"
    }
  })
})

const schema = new graphql.GraphQLSchema({
  query,
  mutation
});

app.use('/gqlapi', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

//toys properties
app.get('/api/v1/itemsByCode/:code', dbapi.getItemByCode);
app.get('/api/v1/itemsByBarcode/:barcode', dbapi.getItemByBarcode);
app.get('/api/v1/itemsByArticul/:articul', dbapi.getItemByArticul);
app.get('/api/v1/items', dbapi.getItemsByquery);
//customer part
app.get('/api/v1/customeractivated/', dbapi.isCustomerActivated);
app.get('/api/v1/activatecustomer/:uid', dbapi.activateCustomerByUid);
app.get('/api/v1/deactivatecustomer/:uid', dbapi.deactivateCustomerByUid);
//users part
app.post('/api/v1/lg', dbapi.createUser);
app.get('/api/v1/lg', dbapi.loginUser);
app.get('/api/v1/user', dbapi.checkUser);