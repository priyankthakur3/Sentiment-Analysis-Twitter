import { ObjectId } from "mongodb";
import { locations } from "../config/mongoCollection.js";
import { isID } from "../helpers.js";
import fs from "fs/promises";

async function loadAndParseTopoJSON(filePath) {
  try {
    // Read the JSON file
    const fileData = await fs.readFile(filePath, "utf8");

    // Parse the JSON data
    const jsonData = JSON.parse(fileData);
    return jsonData;
  } catch (error) {
    console.error("Error occurred while loading and parsing TopoJSON:", error);
  }
}

const getGeoData = async (country) => {
  let topoData = await loadAndParseTopoJSON("./atlastopojson.json");
  for (let x of topoData.objects.countries.geometries) {
    if (x.properties.name == country) {
      return {
        type: x.type,
        arcs: x.arcs,
      };
    }
  }
};
const getAll = async () => {
  let locCollection = await locations();
  let allLocations = await locCollection
    .find(
      {}
      // , { projection: { coordinate: 0 } }
    )
    .toArray();

  for (let location of allLocations) {
    location._id = location._id.toString();
    // location._id = { $oid: `${location._id.toString()}` };
    // location.coordinate = await getGeoData(location.country);
  }

  // allLocations = allLocations.map((location) => {

  //   return location;
  // });

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
