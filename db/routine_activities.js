const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [routineAct],
    } = await client.query(
      `
      INSERT INTO routine_activities ("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [routineId, activityId, count, duration]
    );

    return routineAct;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivityById(id) {
  try {
    const {
      rows: [rouAct],
    } = await client.query(
      `
      SELECT *
      FROM routine_activities
      WHERE id=$1;
    `,
      [id]
    );

    return rouAct;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: rouAct } = await client.query(
      `
      SELECT routine_activities.*, activities.name, activities.description
      FROM activities
      JOIN routine_activities ON "activityId"=activities.id
      WHERE "routineId"=$1;
    `,
      [id]
    );

    return rouAct;
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [rouAct],
    } = await client.query(
      `
      UPDATE routine_activities
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(fields)
    );

    return rouAct;
  } catch (error) {
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try {
    const {
      rows: [rouAct],
    } = await client.query(
      `
      DELETE FROM routine_activities
      WHERE id=$1
      RETURNING *;
    `,
      [id]
    );

    return rouAct;
  } catch (error) {
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const {
      rows: [routine_activities],
    } = await client.query(
      `
    SELECT *
    FROM routine_activities
    JOIN routines ON routine_activities."routineId" = routines.id
    WHERE routine_activities.id = $1;
    `,
      [routineActivityId]
    );

    if (routineActivityId === userId) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};