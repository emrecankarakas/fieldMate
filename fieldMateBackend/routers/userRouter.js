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

    const {otpEntered, fullname, email, password, role, age, avatar} = req.body;

    const findOTPQuery = 'SELECT * FROM otp WHERE email = $1 AND otp = $2';
    const otpResult = await postgresClient.query(findOTPQuery, [
      email,
      otpEntered,
    ]);

    if (otpResult.rows.length === 1) {
      const user_id = uuidv4();

      const insertQuery =
        'INSERT INTO users ("user_id", fullname, email, password, role, age, avatar) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';

      const result = await postgresClient.query(insertQuery, [
        user_id,
        fullname,
        email,
        password,
        role,
        age,
        avatar,
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

router.post('/add-friend', async (req, res) => {
  try {
    const {user_id, friendId} = req.body;

    if (user_id === friendId) {
      return res
        .status(400)
        .json({message: 'You cannot send a friend request to yourself.'});
    }

    const checkFriendshipQuery =
      'SELECT * FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)';
    const friendshipResult = await postgresClient.query(checkFriendshipQuery, [
      user_id,
      friendId,
    ]);

    if (friendshipResult.rows.length > 0) {
      return res
        .status(400)
        .json({message: 'This user is already your friend.'});
    }

    const checkFriendRequestQuery =
      'SELECT * FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2';
    const existingFriendRequest = await postgresClient.query(
      checkFriendRequestQuery,
      [user_id, friendId],
    );

    if (existingFriendRequest.rows.length > 0) {
      return res.status(400).json({
        message: 'Friend request already sent to this user.',
      });
    }

    const sendFriendRequestQuery =
      'INSERT INTO friend_requests (sender_id, receiver_id) VALUES ($1, $2) RETURNING *';
    const friendRequestResult = await postgresClient.query(
      sendFriendRequestQuery,
      [user_id, friendId],
    );

    res.status(200).json({
      message: 'Friend request sent.',
      friendRequest: friendRequestResult.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to send friend request.'});
  }
});

router.get('/get-friends/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;

    const getFriendsQuery =
      'SELECT users.user_id, users.fullname, users.email, users.role, users.age ,users.avatar FROM users INNER JOIN friendships ON users.user_id = friendships.friend_id WHERE friendships.user_id = $1';
    const friendsResult = await postgresClient.query(getFriendsQuery, [
      user_id,
    ]);

    res.status(200).json({friends: friendsResult.rows});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to list friends.'});
  }
});

router.get('/get-friend-requests/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;

    const getFriendRequestsQuery =
      'SELECT   friend_requests.request_id as friend_request_id,   users.user_id,  users.fullname, users.email,   users.role,  users.age,users.avatar  FROM  users INNER JOIN friend_requests ON users.user_id = friend_requests.sender_id WHERE friend_requests.receiver_id = $1   ';
    const friendRequestsResult = await postgresClient.query(
      getFriendRequestsQuery,
      [user_id],
    );

    res.status(200).json({friendRequests: friendRequestsResult.rows});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to list friend requests.'});
  }
});

router.post('/accept-friend-request', async (req, res) => {
  try {
    const {user_id, friendRequestId} = req.body;

    const getFriendRequestQuery =
      'SELECT * FROM friend_requests WHERE request_id = $1';
    const friendRequestResult = await postgresClient.query(
      getFriendRequestQuery,
      [friendRequestId],
    );

    if (friendRequestResult.rows.length === 0) {
      return res.status(400).json({message: 'Friend request not found.'});
    }

    const deleteFriendRequestQuery =
      'DELETE FROM friend_requests WHERE request_id = $1';
    await postgresClient.query(deleteFriendRequestQuery, [friendRequestId]);

    const createFriendshipQuery =
      'INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2), ($2, $1)';
    await postgresClient.query(createFriendshipQuery, [
      user_id,
      friendRequestResult.rows[0].sender_id,
    ]);

    res.status(200).json({message: 'Friend request accepted.'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to accept friend request.'});
  }
});

router.get('/search-user/:username', async (req, res) => {
  try {
    const {username} = req.params;

    const searchUserQuery =
      'SELECT user_id, fullname, email, role, age FROM users WHERE fullname ILIKE $1';
    const searchUserResult = await postgresClient.query(searchUserQuery, [
      `%${username}%`,
    ]);

    if (searchUserResult.rows.length > 0) {
      res.status(200).json({user: searchUserResult.rows[0]});
    } else {
      res.status(404).json({message: 'User not found'});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to search for user'});
  }
});

export default router;
