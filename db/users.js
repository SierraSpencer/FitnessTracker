const client = require("./client");
const bcrypt = require("bcrypt");

// database functions

// user functions
async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const {
      rows: [user],
    } = await client.query(
      `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING 
      RETURNING id, username;
    `,
      [username, hashedPassword]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUser({ username, password }) {
  const user = await getUserByUsername(username);
  // console.log(user);
  const hashedPassword = user.password;

  let passwordsMatch = await bcrypt.compare(password, hashedPassword);

  if (passwordsMatch) {
    delete user.password;
    return user;
  }
  if (!user) {
    throw error;
  }
}

async function getUserById(userId) {
  // console.log(userId);
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE id=$1;
    `,
      [userId]
    );
    // console.log(user);
    delete user.password;
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username=$1;
    `,
      [username]
    );

    // console.log(user);
    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
