const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("node_modules"));
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const dataFilePath = path.join(__dirname, "data", "games.json");
let data = [];
try {
  const fileData = fs.readFileSync(dataFilePath, "utf8");
  data = JSON.parse(fileData);
} catch (error) {
  console.error("Error reading or parsing JSON file:", error);
}

app.get("/api/games", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / limit);
  res.json({
    currentPage: page,
    totalPages: totalPages,
    data: paginatedData,
  });
});

app.get("/games/freegames", function (req, res) {
  const freeGames = data.filter((u) => u.full_price === 0);
  console.log("Free games:", freeGames);
  res.render("freegames", {
    freeGames,
  });
});
app.get("/games/paidgames", function (req, res) {
  const paidGames = data.filter((u) => u.full_price > 0);
  res.render("paidgames", {
    paidGames,
  });
});
app.get("/games/:sid", function (req, res) {
  const game = data.find((u) => u.sid == req.params.sid);

  if (!game) {
    return res.status(404).send("Game not found");
    döndür;
  }

  res.render("game-details", { game });
});

app.get("/games", function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = 15;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / limit);

  res.render("games", {
    list: paginatedData,
    totalPages: totalPages,
    currentPage: page,
  });
});
app.get("/", function (req, res) {
  res.render("index");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
