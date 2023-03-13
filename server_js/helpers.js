import { ObjectId } from "mongodb";
//reusing code from lab4
const isID = (id) => {
  /**
   * Function to check if ID is of proper type or Not
   * Input: ID in String
   * Return type: trim varVal in String
   */
  if (typeof id !== "string" || id.trim().length < 1)
    throw new Error("Expected ID to be string");

  id = id.trim();

  if (!ObjectId.isValid(id)) throw new Error(`Invalid Object ID: '${id}'`);

  return id;
};

export { isID };
