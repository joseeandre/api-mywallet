import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import { stripHtml } from "string-strip-html";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import connection from "./database";


const server = express();

server.use(cors());
server.use(express.json());

// fazer cadastro

server.post("/sign-up", async (req, res) => {
  try {
    const name = stripHtml(req.body.name.trim()).result;
    const email = req.body.email.trim();
    const passwordHash = bcrypt.hashSync(req.body.password, 10);

    const existingUser = await connection.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.sendStatus(409);
    }

    await connection.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`,
      [name, email, passwordHash]
    );

    res.sendStatus(201);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// fazer login

server.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  const result = await connection.query(
    `
        SELECT * FROM users
        WHERE email = $1
    `,
    [email]
  );

  const user = result.rows[0];

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = uuidv4();

    await connection.query(
      `
          INSERT INTO sessions ("userId", token)
          VALUES ($1, $2)
        `,
      [user.id, token]
    );

    const response = await connection.query(
      `SELECT id, name FROM users WHERE email = $1`,
      [email]
    );
    const userName = response.rows[0];

    res.send({ token: token, user: userName.name });
  } else {
    res.sendStatus(400);
  }
});

// sessions

server.delete("/logout", async (req, res) => {
  const authorization = req.headers["authorization"];
  const token = authorization.replace("Bearer ", "");

  try {
    await connection.query("DELETE FROM sessions WHERE token = $1", [token]);

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

server.post("/transactions", async (req, res) => {
  try {
    const authorization = req.headers["authorization"];
    const token = authorization.replace("Bearer ", "");
    const type = req.body.type.trim();
    const value = req.body.value.trim();
    const description = req.body.description.trim();

    const result = await connection.query(
      `SELECT "userId" FROM sessions WHERE token = $1`,
      [token]
    );

    const id = result.rows[0].userId;

    if (result.rows.length === 0) {
      return res.sendStatus(409);
    }

    await connection.query(
      `INSERT INTO incomings (value, description, date, type, "userId") VALUES ($1, $2, $3, $4, $5)`,
      [value, description, dayjs(), type, id]
    );

    res.sendStatus(201);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

server.get("/transactions", async (req, res) => {
  try {
    const authorization = req.headers["authorization"];
    const token = authorization.replace("Bearer ", "");

    const result = await connection.query(
      `SELECT "userId" FROM sessions WHERE token = $1`,
      [token]
    );
    const id = result.rows[0].userId;

    const response = await connection.query(
        `SELECT * FROM incomings WHERE "userId" = $1`,
        [id]
      );

    res.send(response.rows);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

server.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
