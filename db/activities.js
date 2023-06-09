const client = require("./client");

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      INSERT INTO activities (name, description)
      VALUES ($1, $2)
      RETURNING *;
    `,
      [name, description]
    );

    return activity;
  } catch (error) {
    throw error;
  }
}

async function getAllActivities() {
  // select and return an array of all activities
  try {
    const { rows: activities } = await client.query(`
      SELECT *
      FROM activities;
    `);

    return activities;
  } catch (error) {
    throw error;
  }
}

async function getActivityById(id) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      SELECT *
      FROM activities
      WHERE id=$1;
    `,
      [id]
    );

    return activity;
  } catch (error) {
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      SELECT *
      FROM activities
      WHERE name=$1;
    `,
      [name]
    );

    return activity;
  } catch (error) {
    throw error;
  }
}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {
  const routinesActivities = [...routines];

  try {
    const { rows: activities } = await client.query(
      `
      SELECT activities.*,
      routine_activities.duration, routine_activities.count, routine_activities."routineId", routine_activities.id AS "routineActivityId" 
      FROM activities
      JOIN routine_activities ON activities.id=routine_activities."activityId"
      `
    );

    for (const routine of routinesActivities) {
      const addActivity = activities.filter(
        (activity) => activity.routineId === routine.id
      );
      routine.activities = addActivity;
    }

    return routinesActivities;
  } catch (error) {
    throw error;
  }
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      UPDATE activities
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(fields)
    );

    return activity;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
