import express from "express";
import postgresClient from "../config/db.js";
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { fullname, email, password, role, age } = req.body;

    const query =
      "INSERT INTO users (fullname, email, password, role, age) VALUES ($1, $2, $3, $4,$5) RETURNING *";
    console.log(fullname);
    console.log(age);
    const result = await postgresClient.query(query, [
      fullname,
      email,
      password,
      role,
      age,
    ]);

    res.status(201).json({ message: "register success", user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "register failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = $1 AND password = $2";

    const result = await postgresClient.query(query, [email, password]);

    if (result.rows.length === 1) {
      res.status(200).json({ message: "login success", user: result.rows[0] });
    } else {
      res.status(401).json({ message: "login failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "login failed" });
  }
});

export default router;
