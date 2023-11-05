// This file should set up the express server as shown in the lecture code
import express from "express";
import configRoutes from "./routes/index.js";
import * as dotenv from "dotenv";
import { loggingMiddleware } from "./middleware.js";
dotenv.config();
const app = express();
const port = 3000;

app.use(express.json());
app.use(loggingMiddleware);

configRoutes(app);

app.listen(port, () => {
  console.log(`[${new Date().toUTCString()}]: Starting Server`);
  console.log(
    `[${new Date().toUTCString()}]: Routes running on http://localhost:${port}`
  );
});
