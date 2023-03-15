import locationRoute from "../routes/locations.js";
import tweetRoute from "../routes/tweets.js";
const constructorMethod = (app) => {
  app.use("/locations", locationRoute);
  app.use("/tweets", tweetRoute);
  app.use("*", (req, res) => {
    res.status(404).json({ error: "Bummer!!! Page Not Found" });
  });
};

export default constructorMethod;
