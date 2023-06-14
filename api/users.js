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
  try 
  {
    const _user = await getUserByUsername(username);
    if (_user) {
      return next({
        name: 'UserExistsError',
        message: `User ${_user.username} is already taken.`,
      });
    }
    if (password.length < 8) {
    return next({
      name: 'MissingCredentialsError',
      message: 'Password Too Short!',
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

    res.status(200).json({
      message: "thank you for signing up",
      token,
      user,
    });
  } catch (error) 
  {
    next(error);
  }
});

// POST /api/users/login
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) 
  {
    return next({
      error: "MissingCredentialsError",
      name: "Error",
      message: "Please supply both a username and password",
    });
  }

  try 
  {
    const user = await getUser({ username, password });
    const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET);
    if (user) 
    {
      res.status(200).json({ message: "you're logged in!", token, user });
    } else 
    {
      return next({
        error: "IncorrectCredentialsError",
        name: "Error",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) 
  {
    next(error);
  }
});

// GET /api/users/me
router.get("/me", async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.headers.authorization;
  if (!auth) 
  {
    res.status(401).send({
      error: "GetUserError",
      name: "Error",
      message: "You must be logged in to perform this action",
    });
  }
  if (auth) 
  {
    try 
    {
      const token = auth.slice(prefix.length);
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      const user = await getUserById(id);
      res.status(200).json(user);
    } catch (error) 
    {
      next(error);
    }
  }
});

// GET /api/users/:username/routines
router.get("/:username/routines", async (req, res, next) => {
  const { username } = req.params; 
  try 
  {
    if (req.user.username === username) 
    {
      const routines = await getAllRoutinesByUser({ username });
      res.status(200).json(routines);
    } else 
    {
      const publicRoutine = await getPublicRoutinesByUser({ username });
      res.status(200).json(publicRoutine);
    }
  } catch (error) 
  {
    next(error);
  }
});

module.exports = router;
