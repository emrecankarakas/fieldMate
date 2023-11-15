import express from 'express';
import postgresClient from '../config/db.js';
import {v4 as uuidv4} from 'uuid';
import speakeasy from 'speakeasy';
import nodemailer from 'nodemailer';

const router = express.Router();

function generateOTP() {
  return speakeasy.totp({
    secret: speakeasy.generateSecret({length: 4}).base32,
    encoding: 'base32',
    step: 180,
    digits: 4,
  });
}

async function sendEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fieldmatedeneme@gmail.com',
      pass: 'dokj hkeq snov kbms',
    },
  });

  const mailOptions = {
    from: 'fieldmatedeneme@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  };

  return transporter.sendMail(mailOptions);
}

router.post('/register', async (req, res) => {
  try {
    const {email} = req.body;

    const checkEmailQuery = 'SELECT * FROM users WHERE email = $1';
    const emailResult = await postgresClient.query(checkEmailQuery, [email]);

    if (emailResult.rows.length > 0) {
      return res.status(400).json({message: 'Email already exists'});
    }

    const checkExistingOTPQuery = 'SELECT * FROM otp WHERE email = $1';
    const existingOTPResult = await postgresClient.query(
      checkExistingOTPQuery,
      [email],
    );

    if (existingOTPResult.rows.length > 0) {
      const deleteExistingOTPQuery = 'DELETE FROM otp WHERE email = $1';
      await postgresClient.query(deleteExistingOTPQuery, [email]);
    }

    const otp = generateOTP();
    await sendEmail(email, otp);

    const insertOTPQuery = 'INSERT INTO otp (email, otp) VALUES ($1, $2)';
    await postgresClient.query(insertOTPQuery, [email, otp]);

    setTimeout(async () => {
      const deleteOTPQuery = 'DELETE FROM otp WHERE email = $1';
      await postgresClient.query(deleteOTPQuery, [email]);
      console.log('OTP record deleted after 3 minutes:', email);
    }, 3 * 60 * 1000);

    res.status(200).json({
      message: 'OTP sent to your email. Use it to complete registration.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Registration failed'});
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    console.log('Received OTP verification request:', req.body);

    const {otpEntered, fullname, email, password, role, age} = req.body;

    const findOTPQuery = 'SELECT * FROM otp WHERE email = $1 AND otp = $2';
    const otpResult = await postgresClient.query(findOTPQuery, [
      email,
      otpEntered,
    ]);

    if (otpResult.rows.length === 1) {
      const userId = uuidv4();

      const insertQuery =
        'INSERT INTO users ("userId", fullname, email, password, role, age) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';

      const result = await postgresClient.query(insertQuery, [
        userId,
        fullname,
        email,
        password,
        role,
        age,
      ]);

      const deleteOTPQuery = 'DELETE FROM otp WHERE email = $1';
      await postgresClient.query(deleteOTPQuery, [email]);

      console.log('Registration successful');
      res.status(201).json({
        message: 'Registration successful',
        user: result.rows[0],
      });
    } else {
      console.log('Invalid OTP code');
      res.status(400).json({message: 'Invalid OTP code'});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Registration failed'});
  }
});

router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;

    const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';

    const result = await postgresClient.query(query, [email, password]);

    if (result.rows.length === 1) {
      res.status(200).json({message: 'login success', user: result.rows[0]});
    } else {
      res.status(401).json({message: 'login failed'});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'login failed'});
  }
});

export default router;
