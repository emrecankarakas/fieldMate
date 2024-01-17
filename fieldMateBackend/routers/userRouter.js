import express from 'express';
import postgresClient from '../config/db.js';
import {v4 as uuidv4} from 'uuid';
import speakeasy from 'speakeasy';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

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
    const {email, username} = req.body;
    const checkUsernameQuery = 'SELECT * FROM users WHERE username = $1';
    const usernameResult = await postgresClient.query(checkUsernameQuery, [
      username,
    ]);

    if (usernameResult.rows.length > 0) {
      return res.status(400).json({message: 'Username already exists'});
    }
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

router.post('/save-fcm-token', async (req, res) => {
  try {
    const {user_id, fcm_token} = req.body;

    const saveFCMTokenQuery =
      'UPDATE users SET fcm_token = $1 WHERE user_id = $2';
    await postgresClient.query(saveFCMTokenQuery, [fcm_token, user_id]);

    res.status(200).json({message: 'FCM token saved successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to save FCM token'});
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    console.log('Received OTP verification request:', req.body);

    const {otpEntered, fullname, email, password, role, age, avatar, username} =
      req.body;

    const findOTPQuery = 'SELECT * FROM otp WHERE email = $1 AND otp = $2';
    const otpResult = await postgresClient.query(findOTPQuery, [
      email,
      otpEntered,
    ]);

    if (otpResult.rows.length === 1) {
      const user_id = uuidv4();
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertQuery =
        'INSERT INTO users ("user_id", fullname, email, password, role, age, avatar, username) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';

      const result = await postgresClient.query(insertQuery, [
        user_id,
        fullname,
        email,
        hashedPassword,
        role,
        age,
        avatar,
        username,
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

    const getUserQuery = 'SELECT * FROM users WHERE email = $1';

    const userResult = await postgresClient.query(getUserQuery, [email]);

    if (userResult.rows.length === 1) {
      const user = userResult.rows[0];

      if (user) {
        res.status(200).json({message: 'login success', user});
      } else {
        res.status(401).json({message: 'login failed'});
      }
    } else {
      res.status(401).json({message: 'login failed'});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'login failed'});
  }
});
router.get('/get-user/:user_id', async (req, res) => {
  try {
    const userId = req.params.user_id;

    const getUserQuery = 'SELECT * FROM users WHERE user_id = $1';

    const userResult = await postgresClient.query(getUserQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({message: 'User not found'});
    }

    const user = userResult.rows[0];
    res.status(200).json({user});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to get user information'});
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
router.post('/reject-friend-request', async (req, res) => {
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

    res.status(200).json({message: 'Friend request rejected.'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to reject friend request.'});
  }
});

router.post('/remove-friend', async (req, res) => {
  try {
    const {user_id, friendId} = req.body;

    const deleteFriendshipQuery =
      'DELETE FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)';
    await postgresClient.query(deleteFriendshipQuery, [user_id, friendId]);

    res.status(200).json({message: 'Friend removed successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to remove friend'});
  }
});

router.get('/get-friends/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;

    const getFriendsQuery =
      'SELECT users.user_id, users.fullname, users.username, users.email, users.role, users.age ,users.avatar, users.team FROM users INNER JOIN friendships ON users.user_id = friendships.friend_id WHERE friendships.user_id = $1';

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
      'SELECT friend_requests.request_id as friend_request_id, users.user_id, users.fullname, users.username, users.email, users.role, users.age,users.avatar FROM users INNER JOIN friend_requests ON users.user_id = friend_requests.sender_id WHERE friend_requests.receiver_id = $1';

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
      'SELECT user_id, fullname, email, role, age, username, avatar FROM users WHERE username ILIKE $1';
    const searchUserResult = await postgresClient.query(searchUserQuery, [
      `%${username}%`,
    ]);

    if (searchUserResult.rows.length > 0) {
      const users = searchUserResult.rows.map(user => ({
        user_id: user.user_id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        age: user.age,
        username: user.username,
        avatar: user.avatar,
      }));

      res.status(200).json({
        users: users,
      });
    } else {
      res.status(404).json({message: 'No users found'});
    }
  } catch (error) {
    console.error('Error in search-user endpoint:', error);
    res.status(500).json({message: 'Failed to search for users'});
  }
});

router.post('/update-team-player/:teamId/:role', async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const role = req.params.role;
    const {updatedPlayer, captainName} = req.body;

    if (!updatedPlayer || typeof updatedPlayer !== 'object') {
      return res.status(400).json({message: 'Invalid input for updatedPlayer'});
    }

    const updatePlayerQuery = `
      UPDATE teams
      SET players = jsonb_set(players, '{${role}}', $1)
      WHERE team_id = $2
    `;
    await postgresClient.query(updatePlayerQuery, [
      JSON.stringify(updatedPlayer),
      teamId,
    ]);

    const sendRequestQuery =
      'INSERT INTO team_requests (team_id, sender_id, receiver_id, role, captain_name) VALUES ($1, $2, $3, $4, $5)';
    await postgresClient.query(sendRequestQuery, [
      teamId,
      updatedPlayer.user_id,
      updatedPlayer.user_id,
      role,
      captainName,
    ]);

    res
      .status(200)
      .json({message: `Team player with role ${role} updated successfully`});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to update team player'});
  }
});

router.post('/create-team', async (req, res) => {
  try {
    const {teamName, captainId, selectedPlayers, captainName} = req.body;

    const createTeamQuery =
      'INSERT INTO teams (team_name, captain_id, players) VALUES ($1, $2, $3) RETURNING *';
    const teamResult = await postgresClient.query(createTeamQuery, [
      teamName,
      captainId,
      {
        ...selectedPlayers,
      },
    ]);

    const teamId = teamResult.rows[0].team_id;

    const updateUserTeamQuery = `
      UPDATE users
      SET team = $1
      WHERE user_id = $2;
    `;

    await postgresClient.query(updateUserTeamQuery, [teamId, captainId]);
    const sendTeamRequests = async () => {
      const sendRequestQuery =
        'INSERT INTO team_requests (team_id, sender_id, receiver_id, role, captain_name) VALUES ($1, $2, $3, $4, $5)';

      for (const role in selectedPlayers) {
        const player = selectedPlayers[role];

        if (player && player.user_id !== captainId) {
          await postgresClient.query(sendRequestQuery, [
            teamId,
            captainId,
            player.user_id,
            role,
            captainName,
          ]);
        }
      }
    };

    await sendTeamRequests();

    res.status(201).json({
      message: 'Team created successfully',
      team: {
        team_id: teamId,
        team_name: teamName,
        captain_id: captainId,
        players: selectedPlayers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to create team'});
  }
});

router.post('/accept-team-request', async (req, res) => {
  try {
    const {user_id, requestId} = req.body;

    const getTeamIdQuery =
      'SELECT team_id, role FROM team_requests WHERE request_id = $1';
    const teamIdResult = await postgresClient.query(getTeamIdQuery, [
      requestId,
    ]);

    const teamId = teamIdResult.rows[0].team_id;
    const role = teamIdResult.rows[0].role;

    const deleteRequestQuery =
      'DELETE FROM team_requests WHERE request_id = $1';
    await postgresClient.query(deleteRequestQuery, [requestId]);

    const updatePlayerStatusQuery = `
      UPDATE teams
      SET players = jsonb_set(players, '{${role}, status}', '"active"')
      WHERE team_id = $1;
    `;

    await postgresClient.query(updatePlayerStatusQuery, [teamId]);

    const updateUserTeamQuery = `
      UPDATE users
      SET team = $1
      WHERE user_id = $2;
    `;

    await postgresClient.query(updateUserTeamQuery, [teamId, user_id]);

    res.status(200).json({message: 'Team request accepted.'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to accept team request.'});
  }
});
router.post('/remove-team-player', async (req, res) => {
  try {
    const {teamId, role, userId} = req.body;

    const updatePlayersQuery = `
      UPDATE teams
      SET players = jsonb_set(players, '{${role}}', 'null')
      WHERE team_id = $1;
    `;
    await postgresClient.query(updatePlayersQuery, [teamId]);

    const updateUserTeamQuery = `
      UPDATE users
      SET team = null
      WHERE user_id = $1;
    `;

    const result = await postgresClient.query(updateUserTeamQuery, [userId]);

    res
      .status(200)
      .json({message: 'Player removed from the team successfully.'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to remove player from the team.'});
  }
});

router.post('/reject-team-request', async (req, res) => {
  try {
    const {receiver_id, team_id, role} = req.body;

    const deleteRequestQuery =
      'DELETE FROM team_requests WHERE receiver_id = $1 AND team_id = $2 AND role = $3';
    await postgresClient.query(deleteRequestQuery, [
      receiver_id,
      team_id,
      role,
    ]);

    const updatePlayersQuery = `
      UPDATE teams
      SET players = jsonb_set(players, '{${role}}', 'null')
      WHERE team_id = $1 AND '${role}' IS NOT NULL;
    `;
    await postgresClient.query(updatePlayersQuery, [team_id]);

    res.status(200).json({message: 'Team request rejected.'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to reject team request.'});
  }
});

router.get('/get-team-requests/:user_id', async (req, res) => {
  try {
    const userId = req.params.user_id;

    const getTeamRequestsQuery =
      'SELECT tr.*,t.team_name,t.captain_id FROM team_requests tr JOIN teams t ON tr.team_id = t.team_id WHERE tr.receiver_id = $1;';

    const teamRequestsResult = await postgresClient.query(
      getTeamRequestsQuery,
      [userId],
    );

    res.status(200).json({teamRequests: teamRequestsResult.rows});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to get team requests.'});
  }
});
router.post('/update-captain/:teamId', async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const {newCaptainId} = req.body;

    const updateCaptainQuery = `
      UPDATE teams
      SET captain_id = $1
      WHERE team_id = $2
    `;
    await postgresClient.query(updateCaptainQuery, [newCaptainId, teamId]);

    res.status(200).json({message: 'Captain updated successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to update captain'});
  }
});

router.get('/get-team/:teamId', async (req, res) => {
  try {
    const teamId = req.params.teamId;

    const getTeamQuery = 'SELECT * FROM teams WHERE team_id = $1';

    const teamResult = await postgresClient.query(getTeamQuery, [teamId]);

    if (teamResult.rows.length === 0) {
      return res.status(404).json({message: 'Team not found'});
    }

    const team = teamResult.rows[0];
    res.status(200).json({team});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to get team information'});
  }
});
router.post('/save-player-ad/:user_id', async (req, res) => {
  try {
    const userId = req.params.user_id;
    const playerAdInfo = req.body;
    const checkExistingAdQuery = 'SELECT * FROM player_ads WHERE user_id = $1';
    const existingAdResult = await postgresClient.query(checkExistingAdQuery, [
      userId,
    ]);

    if (existingAdResult.rows.length > 0) {
      return res
        .status(400)
        .json({message: 'Player ad already exists for this user'});
    }

    const savePlayerAdQuery = `
      INSERT INTO player_ads (user_id, name, role, avatar, available_hours, available_days, location, alternatives)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const result = await postgresClient.query(savePlayerAdQuery, [
      userId,
      playerAdInfo.name,
      playerAdInfo.role,
      playerAdInfo.avatar,
      playerAdInfo.availableHours,
      playerAdInfo.availableDays,
      playerAdInfo.location,
      playerAdInfo.alternatives,
    ]);

    res.status(200).json({
      message: 'Player ad saved successfully',
      playerAd: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to save player ad'});
  }
});
router.get('/get-all-player-ads', async (req, res) => {
  try {
    const getAllPlayerAdsQuery = 'SELECT * FROM player_ads';
    const result = await postgresClient.query(getAllPlayerAdsQuery);

    res.status(200).json({
      message: 'All player ads fetched successfully',
      playerAds: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to fetch player ads'});
  }
});

export default router;
