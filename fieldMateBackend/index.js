import express from 'express';
import postgresClient from './config/db.js';
import userRouter from './routers/userRouter.js';
import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' assert {type: 'json'};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fieldmate-a1554-default-rtdb.firebaseio.com/',
});
const app = express();
app.use(express.json());

app.use('/users', userRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  postgresClient.connect(err => {
    if (err) {
      console.log('Database connection error:', err.stack);
    } else {
      console.log('Database connection successful');
    }
  });
});
