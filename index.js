'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
/*
app.get('/', function (req, res) {
	res.send('566348112')
})
*/

/* you will need this to setup a webhook with the facebook api */
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === "penguin") {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});

// to post data
app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let message = event.message.text

			//generic message
			/*
			if (text === 'Generic'){ 
				console.log("welcome to chatbot")
				  sendGenericMessage(sender)
				continue
			}
			*/
			messageHandler(sender, message)

			//sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200) + " Hi Janet.")
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.FB_PAGE_ACCESS_TOKEN
// const token = "<FB_PAGE_ACCESS_TOKEN>"
const token = "EAAC2Qso94YcBAEbR3RzsOZC2EZC2cw90ZBoXibv0MiarTMZAHaUAsGhiASgPfmmFZBGBfBHYMcBpb0vma1unH5tET6LNB2FOTcxDlaXaCon1yhCRfWzZCFZB4edMztU3fo938rUBx9XNtzqO08eDiZAHUz7nA0iZAOWsWySRGVT6TLAZDZD"

function sendTextMessage(sender, text) {
	let messageData = { text:text }
	
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function sendGenericMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.messenger.com",
						"title": "web url"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Second card",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function messageHandler(sender, message) {
	/*
	Determine how to handle the message
	*/
	let splitmessage = message.toLowerCase().split(' ');

	if (splitmessage.includes('weight') || splitmessage.includes('pounds')) {
		weightTrackingHander(sender, message)
	} 

	else if (splitmessage.includes('i') && splitmessage.includes('did')) {
		taskTrackingHander(sender, message)
	}

	else if (splitmessage.includes('feeling')) {
		moodTrackingHander(sender, message)
	}

	else if (splitmessage.includes('hi') || splitmessage.includes('hello')) {
		greetingHandler(sender, message)
	}

	else if (splitmessage.includes('generic')) {
		genericMessageHandler(sender, message)
	}

	else {
	    sendTextMessage(sender, "Sorry, I could not understand what you were saying...");
	    setTimeout(sendTextMessage(sender, "Note: If you want to record an accomplishment, please prefix your message with \"I did\""),200);
	    //sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200) + " Hi Janet.")
	};
}

function genericMessageHandler(sender, message) {
	//generic message
	console.log("welcome to chatbot")
  	sendGenericMessage(sender)
}

function weightTrackingHander(sender, message) {
	sendTextMessage(sender, "Got it! Your weight for today has been recorded as: " + String(162))
}

function moodTrackingHander(sender, message) {
	/*
	Test cases:

	I am feeling very good: Got it! Your mood for today is 10/10
	I am feeling good: 8/10
	I am feeling bad: 3/10
	I am feeling very bad: 1/10
	
	I am feeling like a 7: Got it! Your mood for today is a 7/10
	*/
	sendTextMessage(sender, "Got it, we have recorded your mood as: " + String("3 out of 10.") + "I hope you feel better soon!")
}

function taskTrackingHander(sender, message) {
	sendTextMessage(sender, "Got it! Your accomplishment for today has been recorded")
	
}

function greetingHander(sender, message) {
	let possible_responses = ["Hello!","Greetings!","Hi!","Hola!"];
	let random_index = Math.floor(Math.random()*4);
	let mymessage = possible_responses[random_index];
	sendTextMessage(sender, mymessage);	
}

app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})



/*
More features to add in the future:

-- Ask some introductory question to learn about the user and collect the data
-- After facebook authentication, data mine the user!
-- connect to wit ai
-- postgresql connection

*/


