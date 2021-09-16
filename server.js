const express = require("express");
const app = express();
const http = require("http").Server(app);
const mongoose = require("mongoose");
const config = require('./config')

const bodyParser = require("body-parser");

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const dbUrl = 'mongodb+srv://mflixAppUser:mflixAppPwd@sandbox.n0mom.mongodb.net/test_db'
const Phones = mongoose.model('phones', {phone: String});

app.get("/test", (req, res, next) => {
  console.log("hello");
  res.sendStatus(200);
});

app.post("/submitNumber", (req, res, next) => {
  console.log(req.body);
  const accountSid = config.accountSid;
  const authToken = config.authToken;
  const client = require("twilio")(accountSid, authToken);

  client.verify.services
    .create({ friendlyName: "My First Verify Service" })
    .then((service) => {
      console.log(service.sid);
      client.verify.services(service.sid)
                   .verifications
                   .create({to: req.body.phone, channel: 'sms'})
                   .then(verification => {
                       registerPhone(verification.to);
                       console.log(verification.to)
                  }).catch((err)=> console.log(err));
    })
    .catch((err) => console.log(err));
});

const registerPhone = (phone) => {
    const phonee = new Phones({phone: phone})
    const result = phonee.save();

    if (!result) {
        res.sendStatus(500);
    }
    console.log('did save', result)
}

app.use("*", (req, res, next) => {
  res.sendStatus(404);
});

mongoose.connect(dbUrl, (err) => {
    if (err) throw err;
    console.log('just connected to db')
    http.listen(7000, () => {
        console.log("server running on 7000...");
      });
});


