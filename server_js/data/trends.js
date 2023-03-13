import { ObjectId } from "mongodb";
import { trends } from "../config/mongoCollection.js";
import { isID } from "../helpers.js";

const getAll = async () => {
  let trendCollection = await trends();

  let allTrendsList = await trendCollection.find({}).toArray();

  allTrendsList = allTrendsList.map((trend) => {
    trend._id = trend._id.toString();
    return trend;
  });
  return allTrendsList;
};

const get = async (id) => {
  try {
    id = isID(id);
  } catch (error) {
    throw error;
  }

  let trendCollection = await trends();
  let trendObj = await trendCollection.findOne({ _id: new ObjectId(id) });

  if (!trendObj) throw new Error(`No Record for id: ${id}`);

  trendObj._id = trendObj._id.toString();
  return trendObj;
};

export default { get, getAll };
