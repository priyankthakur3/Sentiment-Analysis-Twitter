import { Router } from "express";
import { locationData } from "../data/index.js";
import { isID, isNumber, isString } from "../helpers.js";

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    let allLocations = await locationData.getAll();
    res.json(allLocations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.route("/location/stats/:woeid").get(async (req, res) => {
  try {
    req.params.woeid = isString("WOEID", req.params.woeid);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    let tweetStats = await tweetData.getLocationStats(req.params.woeid);
    if (tweetStats[0] !== 200)
      return res.status(tweetStats[0]).json({ error: "Server Error" });
    return res.json({
      length: tweetStats[1].length,
      data: tweetStats[1],
    });
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
    if (!locationObj)
      return res.status(404).json({ error: "Location not Found" });
    res.json(locationObj);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

export default router;
