const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) 
{
  try 
  {
    const {rows} = await client.query(
      `
      INSERT INTO routine_activities ("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [routineId, activityId, count, duration]
    );
    const [routineActivity] = rows;
    return routineActivity;
  } catch (error) 
  {
    console.error(error);
  }
}

async function getRoutineActivityById(id) 
{
  try 
  {
    const {rows} = await client.query(
      `
      SELECT *
      FROM routine_activities
      WHERE id=$1;
    `,
      [id]
    );
    const [routineActivity] = rows;
    return routineActivity;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutineActivitiesByRoutine({ id }) 
{
  try 
  {
    const {rows} = await client.query(
      `
      SELECT routine_activities.*, activities.name, activities.description
      FROM activities
      JOIN routine_activities ON routine_activities."activityId"=activities.id
      WHERE "routineId"=$1;
    `,
      [id]
    );
    rreturn rows;
  } catch (error) 
  {
    console.error(error);
  }
}

async function updateRoutineActivity({ id, ...fields }) 
{
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  try 
  {
    const {rows} = await client.query(
      `
      UPDATE routine_activities
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(fields)
    );
    const [routineActivity] = rows;
    return routineActivity;
  } catch (error) 
  {
    console.error(error);
  }
}

async function destroyRoutineActivity(id) 
{
  try 
  {
    const {rows} = await client.query(
      `
      DELETE FROM routine_activities
      WHERE id=$1
      RETURNING *;
    `,
      [id]
    );
    const [routineActivity] = rows;
    return routineActivity;
  } catch (error) 
  {
    console.error(error);
  }
}

async function canEditRoutineActivity(routineActivityId, userId) 
{
  try 
  {
    const {rows,} = await client.query(
      `
    SELECT *
    FROM routine_activities
    JOIN routines ON routine_activities."routineId" = routines.id
    WHERE routine_activities.id = $1;
    `,
      [routineActivityId]
    );
    const [routineActivity] = rows;
    if (routineActivity.creatorId === userId) 
    {
      return true;
    } else 
    {
      return false;
    }
  } catch (error) 
  {
    console.error(error);
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
