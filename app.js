var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var braintree = require('braintree');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//BrainTree implementation

//merchant credentials
var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   'nt6q55qx9z9bc6hv',
    publicKey:    'cw42fq3tfdks6qw8',
    privateKey:   '9f19effa2c0103da9abe50f5c3f6958a'
});

app.post("/checkout", function (req, res) {
	var nonce = req.body.payment_method_nonce;
	console.log("Nonce: " + nonce);
	gateway.transaction.sale({
		amount: '69.00', 
		paymentMethodNonce: nonce}, 
		function (err, result) {}
	);
	gateway.clientToken.generate({}, function (err, response) {
		res.render("index", {clientToken: response.clientToken});
	});
});

app.use("/", function(req, res){
	gateway.clientToken.generate({}, function (err, response) {
		res.render("index", {clientToken: response.clientToken});
	});
});

//default routing
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;