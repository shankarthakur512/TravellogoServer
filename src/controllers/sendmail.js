import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "skt48324@gmail.com",
    pass: "yzqtltmnjrvkjleh"
  }
});

export const Sendmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const digits = '0123456789';
    let otp = '';
  
    for (let i = 0; i < 6; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }

    const mailOptions = {
      from: 'skt48324@gmail.com',
      to: email.toString(),
      subject: 'The Verification Code',
      text: `Your OTP is ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Error:', error.message);
        return res.status(500).json({ error: 'Failed to send OTP' });
      } else {
        res.status(200).json({ otp });
      }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};
