import axios from "axios";

export default async function sendEmail(email, subject, output) {
  try {
    const res = await axios.post(
      "https://us-central1-teambo-c231b.cloudfunctions.net/sendMail",
      {
        subject,
        email,
        output,
      }
    );
    if (res.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}