import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
var transporterss = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});
export default transporterss;
