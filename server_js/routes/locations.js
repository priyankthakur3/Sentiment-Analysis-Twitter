import { Router } from "express";
import { locationData } from "../data/index.js";
import { isID } from "../helpers.js";

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    let allLocations = await locationData.getAll();
    res.json(allLocations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.route("/:locationid").get(async (req, res) => {
  try {
    req.params.locationid = isID(req.params.locationid);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    let locationObj = await locationData.get(req.params.locationid);
    if (locationObj) res.json(locationObj);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

export default router;
