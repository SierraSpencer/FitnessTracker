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

  try {
    const routineActivity = await getRoutineActivityById(routineActivityId);
    const routine = await getRoutineById(routineActivity.routineId);

    if (routine.creatorId !== req.user.id) {
      next({
        name: "UnauthorizedUpdateError",
        message: `User ${req.user.username} is not allowed to update ${routine.name}`,
      });
    } else {
      const updatedRoutineActivity = await updateRoutineActivity({
        id: routineActivityId,
        duration,
        count,
      });

      res.send(updatedRoutineActivity);
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routine_activities/:routineActivityId
router.delete("/:routineActivityId", requireUser, async (req, res, next) => {
  const { routineActivityId } = req.params;

  try {
    const routineActivity = await getRoutineActivityById(routineActivityId);
    const routine = await getRoutineById(routineActivity.routineId);

    if (routine.creatorId !== req.user.id) {
      res.status(403).send({
        error: "UnauthorizedUpdateError",
        name: "UnauthorizedUpdateError",
        message: `User ${req.user.username} is not allowed to delete ${routine.name}`,
      });
    } else {
      const deleteRoutineActivity = await destroyRoutineActivity(
        routineActivityId
      );

      res.send(deleteRoutineActivity);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;