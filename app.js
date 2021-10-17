const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const router = require("./route_controller");

const app = express();

app.use(express.json());

app.get("/", (req, res, next) => {
  res.send("Well Come to Dua and Zikir API");
});

app.use("/api/v1/", router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is listning on port ", PORT);
});
