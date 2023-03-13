import { MongoClient } from "mongodb";
import { mongoConfig } from "./settings.js";

let _connection = undefined;
let _db = undefined;

const dbConnection = async () => {
  try {
    if (!_connection) {
      _connection = await MongoClient.connect(mongoConfig.serverURL);
      _db = _connection.db(mongoConfig.database);
    }

    return _db;
  } catch (error) {
    console.log(`Error: Connecting to Database : ${error.message}`);
  }
};

const closeConnection = async () => {
  await _connection.close();
};

export { dbConnection, closeConnection };
