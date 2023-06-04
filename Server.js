const express = require("express");
const app = express();
require("dotenv").config();
var cors = require("cors");
const port = process.env.PORT || 5000;
const accountSid = 'AC4020f24e0db2575740d473a2228a5d1a';
const authToken = 'dc163037bcd4fb3fa5e0e4dbd1c4931c';
const client = require('twilio')(accountSid, authToken);

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/notify", (req, res) => {
  const msg = req.body.msg;
  const phn_no = req.body.phn;
  console.log(req)
  client.messages
    .create({
      body: msg,
      from: 'whatsapp:+15074193249',
      to: 'whatsapp:+91'+phn_no
    })
    .then(message => res.send(message))
});

app.listen(port, () => console.log(`server started on port ${port}`));
