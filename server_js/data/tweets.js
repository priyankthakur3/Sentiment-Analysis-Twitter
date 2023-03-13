import { ObjectId } from "mongodb";
import { tweets } from "../config/mongoCollection.js";
import { isID } from "../helpers.js";

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

export default { getAll, get };
