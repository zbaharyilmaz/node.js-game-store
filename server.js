const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;

// Production optimizations
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

app.set("view engine", "ejs");
app.use(express.static("node_modules"));
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dataFilePath = path.join(__dirname, "data", "games.json");
let data = [];
try {
  const fileData = fs.readFileSync(dataFilePath, "utf8");
  data = JSON.parse(fileData);
} catch (error) {
  console.error("Error reading or parsing JSON file:", error);
}

app.get("/api/games", (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / limit);

    res.json({
      currentPage: page,
      totalPages: totalPages,
      totalItems: data.length,
      data: paginatedData,
    });
  } catch (error) {
    console.error("Error in /api/games:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/games/freegames", function (req, res) {
  try {
    const freeGames = data.filter((u) => u.full_price === 0);
    res.render("freegames", {
      freeGames,
    });
  } catch (error) {
    console.error("Error in /games/freegames:", error);
    res.status(500).render("404");
  }
});

app.get("/games/paidgames", function (req, res) {
  try {
    const paidGames = data.filter((u) => u.full_price > 0);
    res.render("paidgames", {
      paidGames,
    });
  } catch (error) {
    console.error("Error in /games/paidgames:", error);
    res.status(500).render("404");
  }
});

app.get("/games/:sid", function (req, res) {
  try {
    const gameId = parseInt(req.params.sid);

    if (isNaN(gameId)) {
      return res.status(400).render("404");
    }

    const game = data.find((u) => u.sid === gameId);

    if (!game) {
      return res.status(404).render("404");
    }

    res.render("game-details", { game });
  } catch (error) {
    console.error("Error in /games/:sid:", error);
    res.status(500).render("404");
  }
});

app.get("/games", function (req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;

    // Validate pagination
    if (page < 1) {
      return res.status(400).render("404");
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / limit);

    res.render("games", {
      list: paginatedData,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error in /games:", error);
    res.status(500).render("404");
  }
});

app.get("/", function (req, res) {
  try {
    res.render("index");
  } catch (error) {
    console.error("Error in /:", error);
    res.status(500).render("404");
  }
});

// 404 handler
app.use(function (req, res) {
  res.status(404).render("404");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
