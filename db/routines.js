const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) 
{
  try 
  {
    const {rows} = await client.query(
      `
      INSERT INTO routines ("creatorId", "isPublic", name, goal)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [creatorId, isPublic, name, goal]
    );
    const [routine] = rows;
    return routine;
  } catch (error) 
  {
    console.error(error);
  }
}

async function getRoutineById(id) 
{
  try 
  {
    const {rows} = await client.query(
      `
      SELECT *
      FROM routines
      WHERE id=$1;
    `,
      [id]
    );
    const [routine] = rows;
    return routine;
  } catch (error) 
  {
    console.error(error);
  }
}

async function getRoutinesWithoutActivities() 
{
  try 
  {
    const {rows} = await client.query(`
      SELECT routines.*, users.username as "creatorName"
      FROM routines
      JOIN users ON users.id=routines."creatorId";
    `);
    return rows;
  } catch (error) 
  {
    console.error(error);
  }
}

async function getAllRoutines() 
{
  try 
  {
    const routines = await getRoutinesWithoutActivities();
    await attachActivitiesToRoutines(routines);
    return routines;
  } catch (error) 
  {
    console.error(error);
  }
}

async function getAllPublicRoutines() 
{
  try 
  {
    const {rows} = await client.query(
      `
      SELECT routines.*, users.username as "creatorName"
      FROM routines
      JOIN users ON users.id=routines."creatorId"
      WHERE "isPublic"=true;
    `
    );
    await attachActivitiesToRoutines(rows);
    return rows;
  } catch (error) 
  {
    console.error(error);
  }
}

async function getAllRoutinesByUser({ username }) 
{
  try 
  {
    const {rows} = await client.query(
      `
      SELECT routines.*, users.username as "creatorName"
      FROM routines
      JOIN users ON users.id=routines."creatorId"
      WHERE username=$1;
    `,
      [username]
    );
    await attachActivitiesToRoutines(rows);
    return rows;
  } catch (error) 
  {
    console.error(error);
  }
}

async function getPublicRoutinesByUser({ username }) 
{
  try 
  {
    const {rows} = await client.query(
      `
      SELECT routines.*, users.username as "creatorName"
      FROM routines
      JOIN users ON users.id=routines."creatorId"
      WHERE "isPublic"=true AND username=$1;
    `,
      [username]
    );
    await attachActivitiesToRoutines(rows);
    return rows;
  } catch (error) 
  {
    console.error(error);
  }
}

async function getPublicRoutinesByActivity({ id }) 
{
  try 
  {
    const {rows} = await client.query(
      `
      SELECT routines.* , users.username AS "creatorName",
      routine_activities.duration, routine_activities.count, routine_activities.id as "routineActivityId"
      FROM routines
      JOIN users 
      ON users.id=routines."creatorId"
      JOIN routine_activities
      ON routine_activities."routineId"=routines.id
      WHERE "isPublic"=true 
      AND "activityId"=$1;
      `,
      [id]
    );
    await attachActivitiesToRoutines(rows);
    return rows;
  } catch (error) 
  {
    console.error(error);
  }
}

async function updateRoutine({ id, ...fields }) 
{
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  try 
  {
    const {rows} = await client.query(
      `
    UPDATE routines
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
  `,
      Object.values(fields)
    );
    const [routine] = rows;
    return routine;
  } catch (error) 
  {
    console.error(error);
  }
}

async function destroyRoutine(id) 
{
  try 
  {
    await client.query(
      `
      DELETE FROM routine_activities
      WHERE "routineId"=$1
    `,
      [id]
    );
    const {rows} = await client.query(
      `
      DELETE FROM routines 
      WHERE id=$1
      RETURNING *;
    `,
      [id]
    );
    const [routine] = rows;
    return routines;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
