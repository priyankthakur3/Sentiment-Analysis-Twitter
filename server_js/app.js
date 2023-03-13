// This file should set up the express server as shown in the lecture code
import express from "express";
import configRoutes from "./routes/index.js";

const app = express();
const port = 3000;

app.use(express.json());

configRoutes(app);

app.listen(port, () => {
  console.log("We've now got a server!");
  console.log(`Your routes will be running on http://localhost:${port}`);
});
