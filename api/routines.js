const express = require("express");
const router = express.Router();

const {
  getAllPublicRoutines,
  createRoutine,
  getRoutineById,
  updateRoutine,
  destroyRoutine,
  getRoutineActivitiesByRoutine,
  addActivityToRoutine,
} = require("../db");
const { requireUser } = require("./utils");

// GET /api/routines
router.get("/", async (req, res, next) => {
  try 
  {
    const routines = await getAllPublicRoutines();
    res.status(200).json(routines);
  } catch (error) 
  {
    next(error);
  }
});

// POST /api/routines
router.post("/", requireUser, async (req, res, next) => {
  const { isPublic, name, goal } = req.body;
  console.log(req.user);
  try 
  {
    if (!req.user) 
    {
      next({
        name: "UnauthorizedError",
        message: "You must be logged in to perform this action",
      });
    }

    if (req.user) 
    {
      const creatorId = req.user.id;
      const routine = await createRoutine({ creatorId, isPublic, name, goal });
      res.status(200).json(routine);
    }
  } catch (error) 
  {
    next(error);
  }
});

// PATCH /api/routines/:routineId
router.patch("/:routineId", requireUser, async (req, res, next) => {
  const { routineId } = req.params;
  const { isPublic, name, goal } = req.body;
  try 
  {
    const routine = await getRoutineById(routineId);
    if (routine.creatorId !== req.user.id) 
    {
      res.status(403).json({
        error: "UnauthorizedUpdateError",
        name: "Error",
        message: `User ${req.user.username} is not allowed to update ${routine.name}`,
      });
    } else 
    {
      const updatedRoutine = await updateRoutine({
        id: routineId,
        isPublic,
        name,
        goal,
      });
      res.status(200).json(updatedRoutine);
    }
  } catch (error) 
  {
    next(error);
  }
});

// DELETE /api/routines/:routineId
router.delete("/:routineId", requireUser, async (req, res, next) => {
  const { routineId } = req.params;
  try 
  {
    const routine = await getRoutineById(routineId);
    if (routine.creatorId != req.user.id) 
    {
      res.status(403).json({
        error: "UnauthorizedUpdateError",
        name: "Error",
        message: `User ${req.user.username} is not allowed to delete ${routine.name}`,
      });
    } else 
    {
      await destroyRoutine(routineId);
      res.status(200).json(deletedRoutine);
    }
  } catch (error) 
  {
    next(error);
  }
});

// POST /api/routines/:routineId/activities
router.post("/:routineId/activities", async (req, res, next) => {
  const { routineId } = req.params;
  const { activityId, duration, count } = req.body;
  const routineActivityId = await getRoutineActivitiesByRoutine({
    id: routineId,
  });
  try 
  {
    const routineAdded = routineActivityId.find(
      (routineActivity) => routineActivity.activityId === req.body.activityId
    );
    if (routineAdded) 
    {
      res.send({
        error: "DuplicateRoutineActivityError",
        name: "Error",
        message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
      });
    } else 
    {
      const routineActivity = await addActivityToRoutine({
        routineId,
        activityId,
        duration,
        count,
      });
      res.status(200).json(routineActivity);
    }
  } catch (error) 
  {
    next(error);
  }
});
module.exports = router;
