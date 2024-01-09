import nodemailer from 'nodemailer';
// import SettingModel from '../model/setting.model.js';

// eslint-disable-next-line no-unused-vars
const sendEmail = async function (mailOptions, id) {

  // const setting = await SettingModel.findById(id);


  const transport = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port:2525,
    auth: {
      user:'d321a8483977ee',
      pass:'d84a1bf431bebe',
    },
  });
  transport.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log('transpoter error =>', err);
    } else {
      console.log(`Email sent:${  info.response}`);
    }
  });
};
export default sendEmail;
