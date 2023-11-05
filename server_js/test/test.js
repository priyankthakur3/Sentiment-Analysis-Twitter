import { tweetData } from "../data/index.js";
import { closeConnection } from "../config/mongoConnection.js";

const allTweets = await tweetData.get("63b6702f6f2dcafc156190f8");

console.log(allTweets);

await closeConnection();
