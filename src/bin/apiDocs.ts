let express = require('express')
    , http = require('http')
    , path = require('path')
    , basicAuth = require('express-basic-auth')
    , app = express();

// all environments
app.set('port', process.env.PORT || 16020);

let auth = basicAuth({
  users: {
      'user': 'password2017!'
  },
  challenge: true,
  realm: 'og00987'
});

// app.use([auth, express.static(path.join(__dirname, '../../../docs/API/'))]);
app.use([express.static(path.join(__dirname, '../../../docs/API/'))]);

http.createServer(app).listen(app.get('port'), function () {
    console.log(`Doc http server listening on port %d`, app.get('port'));
});