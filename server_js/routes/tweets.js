import { Router } from "express";
import { tweetData } from "../data/index.js";
import { isID, isString, isNumber } from "../helpers.js";

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    let allTweets = await tweetData.getAll();
    res.json(allTweets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.route("/stats").get(async (req, res) => {
  try {
    let tweetStats = await tweetData.getAll();
    res.json(allTweets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.route("/location/:woeid").get(async (req, res) => {
  try {
    req.params.woeid = isString("WOEID", req.params.woeid);

    req.params.woeid = Number(req.params.woeid);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  try {
    let tweetsList = await tweetData.getTweetWOEID(req.params.woeid);
    res.json(tweetsList);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
router.route("/:id").get(async (req, res) => {
  try {
    req.params.id = isID(req.params.id);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    let tweetObj = await tweetData.get(req.params.id);
    if (!tweetObj) return res.status(404).json({ error: "tweet not found" });

    res.json(tweetObj);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

export default router;
