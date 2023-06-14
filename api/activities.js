const express = require("express");
const router = express.Router();

const 
{
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

  try 
  {
    const actRoutines = await getPublicRoutinesByActivity({ id: activityId });
    if (actRoutines.length === 0) 
    {
      res.send({
        error: "ActivityExistsError",
        name: "ActivityExistsError",
        message: `Activity ${activityId} not found`,
      });
    }
    res.send(actRoutines);
  } catch (error) 
  {
    next(error);
  }
});

// GET /api/activities
router.get("/", async (req, res, next) => {
  try 
  {
    const activities = await getAllActivities();
    res.send(200).json(activities);
  } catch (error) 
  {
    next(error);
  }
});

// POST /api/activities
router.post("/", requireUser, async (req, res, next) => {
  const { name, description } = req.body;

  try 
  {
    const _activity = await getActivityByName(name);
    if (_activity) 
    {
      res.send({
        error: "ActivityExistsError",
        name: "ActivityExistsError",
        message: `An activity with name ${name} already exists`,
      });
    } else 
    {
      const activity = await createActivity({ name, description });
      res.send(activity);
    }
  } catch (error) 
  {
    next(error);
  }
});

// PATCH /api/activities/:activityId
router.patch("/:activityId", requireUser, async (req, res, next) => {
  const { activityId } = req.params;
  
   try 
   {
    const activity = await getActivityById(activityId);
    if (!activity) 
    {
      return next({
        name: 'NotFound',
        message: `Activity ${activityId} not found`,
      });
    }

    if (req.body.name) 
    {
      const _activity = await getActivityByName(req.body.name);
      if (_activity && _activity.id !== activityId) 
      {
        return next({
          name: 'DuplicateRequest',
          message: `An activity with name ${req.body.name} already exists`,
        });
      }
    }
     
    const updatedActivity = await updateActivity({
      id: activityId,
      name,
      description,
    });
    res.status(200).json(updatedActivity);
  } catch (error) 
  {
    next(error);
  }
});

module.exports = router;
