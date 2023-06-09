/* eslint-disable no-useless-catch */
require("dotenv").config();

const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const bcrypt = require("bcrypt");

const {
  createUser,
  getUserByUsername,
  getUser,
  getUserById,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
} = require("../db");

// POST /api/users/register
router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      res.send({
        error: "UserExistsError",
        message: `User ${username} is already taken.`,
        name: "UsernameExists",
      });
    }

    if (password.length < 8) {
      res.send({
        error: "PasswordLengthError",
        message: "Password Too Short!",
        name: "Short Password",
      });
    }

    const user = await createUser({ username, password });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET
    );

    res.send({
      message: "thank you for signing up",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/login
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.send({
      error: "MissingCredentialsError",
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUser({ username, password });

    const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET);

    if (user) {
      res.send({ message: "you're logged in!", token, user });
    } else {
      res.send({
        error: "IncorrectCredentialsError",
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/users/me
router.get("/me", async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.headers.authorization;

  if (!auth) {
    res.status(401).send({
      error: "GetUserError",
      name: "UnauthorizedError",
      message: "You must be logged in to perform this action",
    });
  }

  if (auth) {
    try {
      const token = auth.slice(prefix.length);

      const { id } = jwt.verify(token, process.env.JWT_SECRET);

      const user = await getUserById(id);

      res.send(user);
    } catch (error) {
      next(error);
    }
  }
});

// GET /api/users/:username/routines
router.get("/:username/routines", async (req, res, next) => {
  const { username } = req.params;
  // console.log(req.user);
  // console.log(username);
  try {
    if (req.user.username === username) {
      const routines = await getAllRoutinesByUser({ username });
      res.send(routines);
    } else {
      const publicRoutine = await getPublicRoutinesByUser({ username });
      res.send(publicRoutine);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;