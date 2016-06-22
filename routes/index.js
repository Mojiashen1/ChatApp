var express = require('express');
var router = express.Router();
var models = require('../models/models');
var Contact = models.Contact;
var Message = models.Message;
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.redirect('/contacts');
// });

router.get('/contacts', function(req, res) {
  Contact.find(function(error, contacts) {
    if (error) {
      res.status(500).send('error', {
        message: error
      })
    }
    res.render('contacts', {
        contacts: contacts
      });
  })
});

router.get('/contacts/new', function(req, res) {
  res.render('editContact');
});

router.post('/contacts/new', function(req, res) {
  var c = new Contact({
    name: req.body.name,
    phone: req.body.phone
  })
  c.save(function(error) {
    if (error) {
      res.status(400).send(error);
    } else {
      res.redirect('/contacts')
    }
  })
});

router.get('/contacts/:id', function(req, res) {
  Contact.findById(req.params.id, function(error, contact) {
    if(! contact) {
      res.status(404).send("NOT FOUND");
    } else if (error) {
      res.status(400).render('error', {
        message: error
      })
    } else {
      res.render('editContact', {
        contact: contact //contact.name in editContact.hbs
      })
    }
  })
})

router.post('/contacts/:id', function(req, res) {
  Contact.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    phone: req.body.phone
    // _id: req.body._id
  }, function(error) {
    if (error) {
      res.status(400).send(error);
    } else {
      res.redirect('/contacts')
    }
  })
});

router.get('/messages', function(req, res) {
  Message.find(function(error, messages) {
    if (error) {
      res.status(500).send('error', {
        message: error
      })
    }
    res.render('messages', {
          messages: messages
      });
  })
});

router.get('/messages/:contactId', function(req, res) {
    Message.find({contact: req.params.contactId}, function(error, messages) {
      Contact.findById(function(error, contact) {
        if (error) {
          res.status(500).send('error', {
            message: error
          })
        }
        res.render('messages', {
              messages: messages,
              contact: contact
        });
      })
    });
});

router.get('/newMessages/:contactId', function(req, res) {
  Contact.findById(req.params.contactId, function(error, contact) {
      if (error) {
        res.status(500).send('error', {
          message: error
        })
      }
      res.render('newMessage', {
            contact: contact
      });
    })
  });

router.post('/newMessages/:contactId', function(req, res) {
  //require the Twilio module and create a REST client
  var client = require('twilio')(ACCOUNT_SID, ACCOUNT_TOKEN);

  //Send an SMS text message
  client.sendMessage({

      to: '+17132542259', // Any number Twilio can deliver to
      from: '+16693330850 ', // A number you bought from Twilio and can use for outbound communication
      body: 'Test message' // body of the SMS message

//make this hidden in newMessage

  }, function(err, responseData) { //this function is executed when a response is received from Twilio

      if (!err) { // "err" is an error received during the request, if any

          // "responseData" is a JavaScript object containing data received from Twilio.
          // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
          // http://www.twilio.com/docs/api/rest/sending-sms#example-1

          console.log(responseData.from); // outputs "+14506667788"
          console.log(responseData.body); // outputs "word to your mother."
          var m = new Message({
            created: new Date(),
            content: req.body.message,
            user: req.user._id,
            contact: req.body.contactId
          })
          m.save(function(error) {
            if (error) {
              res.status(400).send(error);
            } else {
              res.redirect('/messages')
            }
          })
      } else {
        res.send(err)
      }
    });
})

router.post('/messages/receive', function(req, res) {
  req.body.Body
  req.body.From
});

router.get('/messages/sendScheduled', function(req, res) {
  Message.find(function(req, res) {
    if (req.body.status === 'scheduled') {
      var client = require('twilio')(ACCOUNT_SID, ACCOUNT_TOKEN);

      //Send an SMS text message
      if (req.body.timeToSend < new Date()) {
      client.sendMessage({

          to: '+17132542259', // Any number Twilio can deliver to
          from: '+16693330850 ', // A number you bought from Twilio and can use for outbound communication
          body: 'Test message' // body of the SMS message

    //make this hidden in newMessage

      }, function(err, responseData) { //this function is executed when a response is received from Twilio

          if (!err) { // "err" is an error received during the request, if any

              // "responseData" is a JavaScript object containing data received from Twilio.
              // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
              // http://www.twilio.com/docs/api/rest/sending-sms#example-1

              console.log(responseData.from); // outputs "+14506667788"
              console.log(responseData.body); // outputs "word to your mother."
              var m = new Message({
                created: new Date(),
                content: req.body.message,
                user: req.user._id,
                contact: req.body.contactId
              })
              m.save(function(error) {
                if (error) {
                  res.status(400).send(error);
                } else {
                  res.redirect('/messages')
                }
              })
              m.status = 'sent';
              res.send('Success!');
          } else {
            res.status(500).send('Error sending')
          }
        });
      }
    }
  })
})


module.exports = router;
