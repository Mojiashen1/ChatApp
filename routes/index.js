var express = require('express');
var router = express.Router();
var models = require('../models/models');
var Contact = models.Contact;
var Message = models.Message;
var User = models.User;
var fromPhone = process.env.FROMPHONE;
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.redirect('/contacts');
// });
router.post('/messages/receive', function(req, res) {
  Contact.findOne({phone: req.body.From}, function(err, contact) {
      // console.log(user, contact);
      if(err) return next(err);
      var message = new Message({
        created: new Date(),
        content: req.body.Body,
        user: contact.owner,
        contact: contact._id,
        status: 'sent',
        from: req.body.from,
        timeToSend: null
      });
      message.save(function(err) {
        if(err) return next(err);
        res.send("message received");
      });
    })
  });


//so twilio would go to /messages/receive first, and then to login page. so our page doesnt need to redirect twilio to login

router.use(function(req, res, next){
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});


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
    phone: req.body.phone,
    owner: req.user._id
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
  Message.find(function(error, responseMessage) {
    Contact.findById(function(error, contact) {
    if (error) {
      res.status(500).send('error', {
        message: error
      })
    }
    res.render('messages', {
      messages: responseMessage.map(function(message) {
        message.you = (message.phone === fromPhone); //create a new key called you
      }),
      contact: contact
      });
    })
  })
});

router.get('/messages/:contactId', function(req, res) {
    Message.find({contact: req.params.contactId}, function(error, responseMessages) {
      Contact.findById(function(error, contact) {
        if (error) {
          res.status(500).send('error', {
            message: error
          })
        }
        res.render('messages', {
          messages: responseMessage.map(function(message) {
            message.you = (message.phone === fromPhone); //create a new key called you
          }),
          contact: {
            name: 'everyone'}
      })
    });
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

router.post('/newMessages/:contactId', function(req, res, next) {

  //require the Twilio module and create a REST client
  var twilio = require('twilio')(process.env.ACCOUNT_SID, process.env.ACCOUNT_TOKEN);
  console.log(process.env.ACCOUNT_SID);
  // console.log()
  Contact.findById(req.params.contactId, function(err, responseContact) {
    twilio.messages.create({
      to: responseContact.phone,
      from: fromPhone,
      body: req.body.message
    }, function(err1, responseData) { //this function is executed when a response is received from Twilio
      console.log(err1)
      if (!err1) { // "err" is an error received during the request, if any

          // "responseData" is a JavaScript object containing data received from Twilio.
          // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
          // http://www.twilio.com/docs/api/rest/sending-sms#example-1

          console.log(responseData.from); // outputs "+14506667788"
          console.log(responseData.body); // outputs "word to your mother."
          var m = new Message({
            created: new Date(),
            content: req.body.message,
            user: responseContact._id,
            contact: req.body.contactId,
            status: 'sent',
            from: fromPhone,
            timeToSend: null
          })
          m.save(function(error) {
            if (error) {
              next(error);
            } else {
              res.redirect('/messages')
            }
          })
      } else {
        next(err1);
      }
    });
  })
})


// router.get('/messages/sendScheduled', function(req, res) {
//   Message.find(function(req, res) {
//     if (req.body.status === 'scheduled') {
//       Contact.findById(req.params.id, function(err, responseContact) {
//         twilio.messages.create({
//           to: responseContact.phone,
//           from: fromPhone,
//           body: req.body.message
//       }, function(err, responseData) { //this function is executed when a response is received from Twilio
//
//           if (!err) { // "err" is an error received during the request, if any
//
//               // "responseData" is a JavaScript object containing data received from Twilio.
//               // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
//               // http://www.twilio.com/docs/api/rest/sending-sms#example-1
//
//               console.log(responseData.from); // outputs "+14506667788"
//               console.log(responseData.body); // outputs "word to your mother."
//               var m = new Message({
//                 created: new Date(),
//                 content: req.body.message,
//                 user: responseContact._id,
//                 contact: req.body.contactId,
//                 status: 'sent',
//                 from: fromPhone,
//                 timeToSend: null
//               })
//               m.save(function(error) {
//                 if (error) {
//                   res.status(400).send(error);
//                 } else {
//                   res.redirect('/messages')
//                 }
//               })
//           } else {
//             res.send(err)
//           }
//         });
//       })
//     }
//   })
// })


module.exports = router;
