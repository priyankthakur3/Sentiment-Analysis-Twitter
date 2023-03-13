import locationRoute from "../routes/locations.js";
const constructorMethod = (app) => {
  app.use("/locations", locationRoute);
  app.use("*", (req, res) => {
    res.status(404).json({ error: "Bummer!!! Page Not Found" });
  });
};

export default constructorMethod;
