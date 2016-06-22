var mongoose = require('mongoose');

// Create a connect.js inside the models/ directory that
// exports your MongoDB URI!
var connect = process.env.MONGODB_URI || require('./connect');

// If you're getting an error here, it's probably because
// your connect string is not defined or incorrect.
mongoose.connect(connect);

// Create all of your models/schemas here, as properties.
var models = {
    // YOUR CODE HERE
    Contact: mongoose.model('Contact', {
      name: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      }
    }),
    User: mongoose.model('User', {
      username: {
        type: String,
        required: true
      },
      password: {
        type: String,
        required: true
      }
    }),
    Message: mongoose.model('Message', {
      created: {
        type: Date,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      user: {
        type: mongoose.Schema.Types.ObjectId, //id of the user
        required: true
      },
      contact: {
        type: mongoose.Schema.Types.ObjectId,  //id of the contact the message was sent to /from
        required: true
      },
      status: {
        type: String, //sent or received or scheduled
        required: true
      },
      from: {
        type: String //10 digit number
      },
      timeToSend: {
        type: Date
      }
    })
};

module.exports = models;
