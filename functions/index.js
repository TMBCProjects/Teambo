require("dotenv").config();
const functions = require("firebase-functions");
const cors = require("cors")({ origin: "*" });
const nodemailer = require("nodemailer");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//

exports.sendMail = functions.https.onRequest((req, res) => {
  cors(req, res, () => {});
  const { subject, email, output } = req.body;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.EMAIL, // generated ethereal user
      pass: process.env.PASSWORD, // generated ethereal password
    },
  });
  let mailOption = {
    from: `Teambo <teamboapp@gmail.com>`, // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    html: output, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      res.status(422).json({ msg: "Fail1" });
    } else {
      res.status(200).json({ msg: "Success" });
    }
  });
});
