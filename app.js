var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var braintree = require('braintree');
var Pusher = require('pusher');
var Sendgrid = require('sendgrid');
var pg = require("pg");

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

//REST API
app.post("/adduser", function(req, res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		if(err) return console.error("ERROR", err);
		if(req.body.email && req.body.name){
			client.query("INSERT INTO users VALUES('" + req.body.email + "', '" + req.body.name + "')", function(err, res){
				done();
				if(err) console.error("ERROR", err);
				console.log(res);
			});
		}
	});
	res.end();
});

app.post("/addquest", function(req, res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		if(err) return console.error("ERROR", err);
		if(req.body.name && req.body.latitude && req.body.longtitude){
			client.query("INSERT INTO quests VALUES(default, '" + req.body.name + "', current_date, 0, null, null, '" + req.body.description + "', " + req.body.latitude + ", " + req.body.longtitude + ")" , function(err, response){
				if(err){
					console.error("ERROR", err);
					res.end(err);
				}
				else{
					client.query("SELECT * FROM quests ORDER BY id DESC LIMIT 1", function(err, response){
						if(err) console.error("ERROR", err);
						done();
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify(response.rows[0].id));
					});
				}
			});
		}
	});
});

app.post("/addfund", function(req, res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		if(err) return console.error("ERROR", err);
		if(req.body.user && req.body.questid && req.body.amount){
			client.query("INSERT INTO transactions VALUES('" + req.body.user + "', " + req.body.questid + ", " + req.body.amount + ")" , function(err, res){
				done();
				if(err) console.error("ERROR", err);
				console.log(res);
			});
		}
	});
	res.end();
});

var picID = 1;
app.post("/addpicture", function(req, res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		if(err) return console.error("ERROR", err);
		if(req.body.questid && req.body.picture){
			client.query("INSERT INTO pictures VALUES(" + picID + ", " + req.body.questid + ", '" + req.body.picture + "')" , function(err, res){
				done();
				if(err) console.error("ERROR", err);
				console.log(res);
			});
			picID++;
		}
	});
	res.end();
});

app.post("/getuser", function(req, res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		if(err) return console.error("ERROR", err);
		if(req.body.email){
			client.query("SELECT * FROM users WHERE email='" + req.body.email + "'", function(err, response){
				done();
				if(err) console.error("ERROR", err);
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(response.rows));
				console.log(JSON.stringify(response.rows));
			});
		}
	});
});

app.post("/getusers", function(req, res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		if(err) return console.error("ERROR", err);
		client.query("SELECT * FROM users", function(err, response){
			done();
			if(err) console.error("ERROR", err);
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(response.rows));
			console.log(JSON.stringify(response.rows));
		});
	});
});

app.post("/getquests", function(req, res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		if(err) return console.error("ERROR", err);
		client.query("SELECT * FROM quests", function(err, response){
			done();
			if(err) console.error("ERROR", err);
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(response.rows));
			console.log(JSON.stringify(response.rows));
		});
	});
});

app.post("/getpictures", function(req, res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		if(err) return console.error("ERROR", err);
		if(req.body.questid){
			client.query("SELECT * FROM pictures WHERE questid=" + req.body.questid, function(err, response){
				done();
				if(err) console.error("ERROR", err);
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(response.rows));
				console.log(JSON.stringify(response.rows));
			});
		}
	});
});

app.post("/getfunds", function(req, res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		if(err) return console.error("ERROR", err);
		if(req.body.questid){
			client.query("SELECT sum(amount) FROM transactions WHERE questid=" + req.body.questid, function(err, response){
				done();
				if(err) console.error("ERROR", err);
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(response.rows));
				console.log(JSON.stringify(response.rows));
			});
		}
	});
});

app.post("/addbidder", function(req, res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		res.setHeader('Content-Type', 'application/json');
		if(err) return console.error("ERROR", err);
		if(req.body.questid && req.body.email && req.body.amount){
			client.query("SELECT \"lowestBidder\", \"lowestBid\" FROM quests WHERE id=" + req.body.questid, function(err, response){
				done();
				if(err) console.error("ERROR", err);
				else if(response.rows[0].lowestBidder == null || parseFloat(response.rows[0].lowestBid) > parseFloat(req.body.amount)){
					console.log("here");
					client.query("UPDATE quests SET \"lowestBidder\"='" + req.body.email + "', \"lowestBid\"=" + req.body.amount + " WHERE id =" + req.body.questid, function(err, response){
						if(err){
							console.error("ERROR", err);
							
							res.end("0");
						}
						else res.end("1");
					});
				}
				else{
					console.log("here");
					res.end("0");
				}
			});
		}
	});
});

//BrainTree implementation

//merchant credentials
/*var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   process.env.BRAINTREE_MERCHANT_ID,
    publicKey:    process.env.BRAINTREE_PUBLIC_KEY,
    privateKey:   process.env.BRAINTREE_PRIVATE_KEY
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
});*/

/*jk*/


var pusher = new Pusher({
   appId: '129473',
   key: '9dbd5642c8f9ba685243',
   secret: '0f8feeeb15e7af342fbe'
});

var sendgrid_client = Sendgrid('abobic', 'zmagalbomobattlehack2015');


app.post('/notification', function(req, res){
    //console.log(req);
    var message = req.body.message;
    console.log(message);
    console.log("ch" + req.body.ch);
    //var channel = pusher.channel(req.body.ch);
    //console.log(channel);
    //if(channel.occupied)
    {
      pusher.trigger('notifications', 'new_notification', {
          message:message
      });
    }/*
    else
    {
      email = new Sendgrid.Email();
      email.addTo("test@email.si");
      email.setFrom("aleksabobic@gmail.com");
      email.setSubject("test mail");
      email.setText("Huehuehue");
      Sendgrid.send(email, function(err, json){
        if(err){return console.error(err);}
        console.log(json);
      })
    }*/
    console.log({message:message});
    res.send("Notification triggered!" + " \"" + message + "\"");
});

/*app.use("/", function(req, res){
	gateway.clientToken.generate({}, function (err, response) {
		res.render("index", {clientToken: response.clientToken});
	});
});*/

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
