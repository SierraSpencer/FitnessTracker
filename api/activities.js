const express = require("express");
const router = express.Router();

const {
  getAllActivities,
  createActivity,
  getActivityByName,
  getActivityById,
  updateActivity,
  getPublicRoutinesByActivity,
} = require("../db");

const { requireUser } = require("./utils");

// GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res, next) => {
  const { activityId } = req.params;

  try {
    const actRoutines = await getPublicRoutinesByActivity({ id: activityId });

    if (actRoutines.length === 0) {
      res.send({
        error: "ActivityExistsError",
        name: "ActivityExistsError",
        message: `Activity ${activityId} not found`,
      });
    }

    res.send(actRoutines);
  } catch (error) {
    next(error);
  }
});

// GET /api/activities
router.get("/", async (req, res, next) => {
  try {
    const activities = await getAllActivities();

    res.send(activities);
  } catch (error) {
    next(error);
  }
});

// POST /api/activities
router.post("/", requireUser, async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const _activity = await getActivityByName(name);

    if (_activity) {
      res.send({
        error: "ActivityExistsError",
        name: "ActivityExistsError",
        message: `An activity with name ${name} already exists`,
      });
    } else {
      const activity = await createActivity({ name, description });

      res.send(activity);
    }
  } catch (error) {
    next(error);
  }
});

// PATCH /api/activities/:activityId
router.patch("/:activityId", requireUser, async (req, res, next) => {
  const { activityId } = req.params;
  const { name, description } = req.body;

  const ogActivity = await getActivityById(activityId);
  const activityName = await getActivityByName(name);

  if (!ogActivity) {
    res.send({
      error: "ActivityNotFoundError",
      name: "ActivityNotFoundError",
      message: `Activity ${activityId} not found`,
    });
  }

  if (activityName) {
    res.send({
      error: "ActivityExistsError",
      name: "ActivityExistsError",
      message: `An activity with name ${name} already exists`,
    });
  }

  try {
    const updatedActivity = await updateActivity({
      id: activityId,
      name,
      description,
    });
    res.send(updatedActivity);
  } catch (error) {
    next(error);
  }
});

module.exports = router;