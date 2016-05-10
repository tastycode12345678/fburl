var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');

var app = express();
var token = "EAAO8CUMzPM8BALbM5UyQKco9OwRnZCdSbZAg8AYUUfdZCIydosSM2XRr4dZAcZBPbU";

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));

app.use(bodyParser.json());

app.get('/', function(req, res) {
  console.log(req);
  res.send('It works!');
});

app.get(['/facebook', '/instagram'], function(req, res) {
  if (
    req.param('hub.mode') == 'subscribe' &&
    req.param('hub.verify_token') == 'token'
  ) {
    res.send(req.param('hub.challenge'));
  } else {
    res.sendStatus(400);
  }
});

app.post('/facebook', function(req, res) {
  console.log('Facebook request body:');
  console.log(req.body);
  // Process the Facebook updates here
  res.sendStatus(200);
});

app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  res.sendStatus(200);
});

app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'my_voice_verify_token') {
    res.send(req.query['hub.challenge']);
	res.sendStatus(200);
  }
  res.send('Error, wrong validation token');
})

app.post('/webhook/', function (req, res) {
	displayHomeScreen();
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
	  text = getText(sender,event.message.text);
      sendTextMessage(sender, text.substring(0, 200));
    }
  }
  res.sendStatus(200);
});

function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token : process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

function getText(sender,text){
	var data;
	if(text.match("Hi, are you a bot?")){
		data = "Of course! My name is Extentia";
	}else if(text.match("What are you doing?")){
		data = "Busy with Techquarium";
	}else{
		data = text;
	}
	showHeaderText(sender);
	return data;
}

function showHeaderText(sender){
	messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://www.extentia.com/wp-content/uploads/2015/03/logo.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.extentia.com/",
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://www.extentia.com/wp-content/uploads/2015/03/logo.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

function displayHomeScreen(){
	messageData =  {
		"setting_type":"call_to_actions",
		"thread_state":"new_thread",
		"call_to_actions":[
		{
			"message":{
				"text":"Welcome to My Company!"
			}
		}
	]};
	request({
		url: 'https://graph.facebook.com/v2.6/{PAGE_ID}/thread_settings',
		qs:{access_token:process.env.PAGE_ACCESS_TOKEN},
		method: 'POST',
		json: {
			receipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body){
		if(error){
			console.log('Error showing welcome screen: ',error);
		}else if(response.body.error){
			console.log('Error: ', response.body.error);
		}
	});
}

app.listen();
