import { ObjectId } from "mongodb";
import { tweets } from "../config/mongoCollection.js";
import { isID, isNumber, isString } from "../helpers.js";

const getAll = async () => {
  const tweetsCollection = await tweets();
  let tweetsList = await tweetsCollection.find({}).toArray();
  tweetsList = tweetsList.map((tweet) => {
    tweet._id = tweet._id.toString();
    tweet.tweet_id = tweet.tweet_id.toString;

    return tweet;
  });

  return tweetsList;
};

const getStats = async () => {
  let tweetsCollection = await tweets();
  let tweetStats = await tweetsCollection.find({});
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
  let tweetsList = await tweetsCollection.find({ WOEID: woeid }).toArray();
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

export default { getAll, get, getTweetWOEID, getNRecords };
