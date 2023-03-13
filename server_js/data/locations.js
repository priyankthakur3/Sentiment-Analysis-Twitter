import { ObjectId } from "mongodb";
import { locations } from "../config/mongoCollection.js";
import { isID } from "../helpers.js";

const getAll = async () => {
  let locCollection = await locations();

  let allLocations = await locCollection.find({}).toArray();
  allLocations = allLocations.map((location) => {
    location._id = location._id.toString();
    return location;
  });

  return allLocations;
};

const get = async (id) => {
  try {
    id = isID(id);
  } catch (error) {
    throw error;
  }
  let locCollection = await locations();

  let locationObj = await locCollection.findOne({ _id: new ObjectId(id) });

  if (!locationObj) throw new Error(`No Location for ID:${id}`);

  locationObj._id = locationObj._id.toString();

  return locationObj;
};

export default { get, getAll };
