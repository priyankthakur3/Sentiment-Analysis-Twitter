import { Router } from "express";
import xss from "xss";
import { tweetData } from "../data/index.js";
import { isID, isString, isNumber } from "../helpers.js";

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    let tweetStats = await tweetData.getStats();
    res.set("Access-Control-Allow-Origin", "*");
    if (tweetStats[0] !== 200) {
      return res.status(tweetStats[0]).json({ error: "Server Error" });
    }

    let finalResponse = {
      data: tweetStats[1],
    };
    return res.json(finalResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.route("/emoji").get(async (req, res) => {
  let param = {};
  if (req.query)
    try {
      param.topic = req.query.topic
        ? isString("topic", xss(req.query.topic))
        : null;
      param.top_n = req.query.maxCount
        ? isNumber("max_count", xss(req.query.maxCount))
        : 20;
      param.woeid = req.query.woeid
        ? isNumber("WOEID", xss(req.query.woeid))
        : NaN;
      param.sentiment = req.query.sentiment
        ? isString("Sentiment", xss(req.query.sentiment))
        : null;
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

  try {
    let response = await tweetData.getEmojiCount(param);
    return res.json(response);
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
