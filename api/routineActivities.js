const express = require("express");
const router = express.Router();

const {
  getRoutineActivityById,
  getRoutineById,
  updateRoutineActivity,
  destroyRoutineActivity,
} = require("../db");

const { requireUser } = require("./utils");

// PATCH /api/routine_activities/:routineActivityId
router.patch("/:routineActivityId", requireUser, async (req, res, next) => {
  const { routineActivityId } = req.params;
  const { duration, count } = req.body;

  try 
  {
    const routineActivity = await getRoutineActivityById(routineActivityId);
    const isOwner = await canEditRoutineActivity(
      routineActivityId,
      req.user.id
    );

    if (!isOwner) 
    {
      next({
        name: 'AuthorizationHeaderError',
        message: `User ${req.user.username} is not allowed to update ${routineActivity.name}`,
      });
    } else 
    {
      const updatedRoutineActivity = await updateRoutineActivity({
        id: routineActivityId,
        duration,
        count,
      });

      res.status(200).json(updatedRoutineActivity);
    }
  } catch (error) 
  {
    next(error);
  }
});

// DELETE /api/routine_activities/:routineActivityId
router.delete("/:routineActivityId", requireUser, async (req, res, next) => {
  const { routineActivityId } = req.params;

  try 
  {
    const routineActivity = await getRoutineActivityById(routineActivityId);
   const isOwner = await canEditRoutineActivity(
        routineActivityId,
        req.user.id
      );

      if (!isOwner) 
      {
        res.status(403).json({
          error: 'AuthorizationHeaderError',
          message: `User ${req.user.username} is not allowed to delete ${routineActivity.name}`,
          name: 'Error',
        });
      }

      res.status(200).json(deletedRoutineActivity);
    }
  } catch (error) 
  {
    next(error);
  }
});

module.exports = router;
