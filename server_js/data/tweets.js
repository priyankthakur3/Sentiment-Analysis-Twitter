import { ObjectId } from "mongodb";
import { locations, tweets } from "../config/mongoCollection.js";
import { isID, isNumber, isString } from "../helpers.js";

const getAll = async () => {
  const tweetsCollection = await tweets();
  let tweetsList = await tweetsCollection
    .find(
      {},
      { projection: { _id: 1, WOEID: 1, tweet_id: 1, tweet_compound_score: 1 } }
    )
    .toArray();
  tweetsList = tweetsList.map((tweet) => {
    tweet._id = tweet._id.toString();
    tweet.tweet_id = tweet.tweet_id.toString;
    return tweet;
  });

  return tweetsList;
};

const getStats = async () => {
  let tweetsCollection = await tweets();
  let tweetStats = await tweetsCollection
    .aggregate([
      {
        $lookup: {
          from: "locations",
          localField: "WOEID",
          foreignField: "woeid",
          as: "LocationData",
        },
      },
      {
        $project: {
          _id: 1,
          country: { $arrayElemAt: ["$LocationData.country", 0] },
          // coordinate: { $arrayElemAt: ["$LocationData.coordinate", 0] },
          WOEID: 1,
          sentiment: {
            $cond: [
              { $lt: ["$tweet_compound_score", -0.5] },
              "Negative",
              {
                $cond: [
                  { $gt: ["$tweet_compound_score", 0.5] },
                  "Positive",
                  "Neutral",
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            sentiment: "$sentiment",
            WOEID: "$WOEID",
            country: "$country",
            // coordinate: "$coordinate",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          woeid: "$_id.WOEID",
          country: "$_id.country",
          sentiment: "$_id.sentiment",
          count: "$count",
        },
      },
    ])
    .toArray();

  if (!tweetStats) return [500, undefined];
  return [200, tweetStats];
};

const getLocationStats = async (woeid) => {
  woeid = isString("WOEID", woeid);
  let locationCollection = await locations();
  let location = await locationCollection.findOne(
    { woeid: Number(woeid) },
    { projection: { _id: 1, name: 1, countryCode: 1 } }
  );
  if (!location) throw new Error(`No Location Exists for ID: ${woeid}`);

  let tweetsCollection = await tweets();
  let tweetStats = await tweetsCollection
    .aggregate([
      {
        $lookup: {
          from: "locations",
          localField: "WOEID",
          foreignField: "woeid",
          as: "LocationData",
        },
      },
      {
        $match: {
          WOEID: Number(woeid),
        },
      },
      {
        $project: {
          _id: 1,
          country: "$LocationData.country",
          WOEID: 1,
          sentiment: {
            $cond: [
              { $lt: ["$tweet_compound_score", -0.5] },
              "Negative",
              {
                $cond: [
                  { $gt: ["$tweet_compound_score", 0.5] },
                  "Positive",
                  "Neutral",
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            sentiment: "$sentiment",
            WOEID: "$WOEID",
            country: "$country",
          },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  if (!tweetStats) return [500, undefined];
  return [200, tweetStats];
};

const getNRecords = async (startindex, maxRecords = 50) => {
  try {
    startindex = isNumber("Start Index", startindex);
  } catch (error) {
    throw error;
  }
  try {
    maxRecords = isNumber("Records", maxRecords);
  } catch (error) {
    throw error;
  }
  const tweetsCollection = await tweets();
  let tweetsList = await tweetsCollection
    .find({})
    .skip(startindex)
    .limit(maxRecords)
    .toArray();
  tweetsList = tweetsList.map((tweet) => {
    tweet._id = tweet._id.toString();
    tweet.tweet_id = tweet.tweet_id.toString;
    return tweet;
  });

  return tweetsList;
};

const getTweetWOEID = async (woeid) => {
  try {
    woeid = isNumber("WOEID", woeid);
  } catch (e) {
    throw e;
  }
  const tweetsCollection = await tweets();
  let tweetsList = await tweetsCollection
    .find({ WOEID: Number(woeid) })
    .toArray();
  tweetsList = tweetsList.map((tweet) => {
    tweet._id = tweet._id.toString();
    tweet.tweet_id = tweet.tweet_id.toString;

    return tweet;
  });
  return tweetsList;
};

const get = async (id) => {
  try {
    id = isID(id);
  } catch (error) {
    throw new error();
  }

  const tweetsCollection = await tweets();

  let tweetObj = await tweetsCollection.findOne({ _id: new ObjectId(id) });

  if (!tweetObj) throw new Error(`No Tweet Present for ID: ${id}`);

  tweetObj._id = tweetObj._id.toString();
  tweetObj.tweet_id = tweetObj.tweet_id.toString();

  return tweetObj;
};

const getEmojiCount = async (param) => {
  let filters = {};
  filters["tweet_emojis"] = { $exists: true, $ne: "" };
  for (const [key, value] of Object.entries(param)) {
    if (key === "topic" && value)
      filters["tweet_search_query"] = { $eq: value };
    if (key === "woeid" && value) filters["WOEID"] = { $eq: value };
    if (key === "sentiment" && value === "positive")
      filters["tweet_compound_score"] = { $gte: 0.5 };
    if (key === "sentiment" && value === "negative")
      filters["tweet_compound_score"] = { $lte: -0.5 };
    if (key === "sentiment" && value === "neutral")
      filters["tweet_compound_score"] = { $gt: -0.5, $lt: 0.5 };
  }
  const tweetsCollection = await tweets();
  let tweetObj = await tweetsCollection
    .aggregate([
      {
        $match: filters,
      },
      {
        $addFields: {
          tweet_emojis: {
            $cond: {
              if: { $isArray: "$tweet_emojis" },
              then: "$tweet_emojis",
              else: { $split: ["$tweet_emojis", ", "] },
            },
          },
          sentiment: {
            $cond: {
              if: { $gt: ["$tweet_compound_score", 0.5] },
              then: "Positive",
              else: {
                $cond: {
                  if: { $lt: ["$tweet_compound_score", -0.5] },
                  then: "Negative",
                  else: "Neutral",
                },
              },
            },
          },
        },
      },

      {
        $unwind: "$tweet_emojis",
      },
      {
        $group: {
          _id: { tweet_emojis: "$tweet_emojis", sentiment: "$sentiment" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      { $limit: param.top_n },
    ])
    .toArray();

  return tweetObj;
};

export default {
  getAll,
  getLocationStats,
  get,
  getTweetWOEID,
  getNRecords,
  getStats,
  getEmojiCount,
};
