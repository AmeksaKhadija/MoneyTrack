const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const expressLayouts = require("express-ejs-layouts");
const { User } = require("./models");
const categoryController = require("./Controllers/categoryController");
const transactionController = require("./Controllers/transactionController");
const authController = require("./Controllers/authController");
const budgetController = require("./Controllers/budgetController");
const savingController = require("./Controllers/savingController");
const statisticsController = require("./Controllers/statisticsController");

const { log } = require("console");

const app = express();
const PORT = process.env.PORT || 4000;


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layout");

const publicPath = path.join(__dirname, "./public");
app.use(express.static(publicPath));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "moneytrack-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    },
  })
);

const requireAuth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect("/login");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.redirect("/login");
  }
};

const requireGuest = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }
  next();
};

// Routes

// Home page - Updated to use Sequelize
app.get("/", async (req, res) => {
  let user = null;

  if (req.session.userId) {
    try {
      user = await User.findByPk(req.session.userId, {
        attributes: ['id', 'username', 'email']
      });
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  res.render("index", {
    title: "Accueil",
    user
  });
});

// Authentication 
app.get("/register", requireGuest, authController.showRegister);
app.post("/register", requireGuest, authController.register);

app.get("/login", requireGuest, authController.showLogin);
app.post("/login", requireGuest, authController.login);

app.post("/logout", authController.logout);

//  budget 
app.get("/budget/setup", requireAuth, budgetController.setup);
app.post("/budget/setup", requireAuth, budgetController.store);
app.get("/budget/edit", requireAuth, budgetController.edit);
app.post("/budget/update", requireAuth, budgetController.update);

// saviengs
//////////////////////////////////////////////
app.get("/savings", requireAuth, budgetController.checkBudget, savingController.index);
app.get("/savings/create", requireAuth, budgetController.checkBudget, savingController.create);
app.post("/savings", requireAuth, budgetController.checkBudget, savingController.store);
app.post("/savings/:id/add", requireAuth, budgetController.checkBudget, savingController.addMoney);
app.post("/savings/:id/withdraw", requireAuth, budgetController.checkBudget, savingController.withdrawMoney);
app.post("/savings/:id/delete", requireAuth, budgetController.checkBudget, savingController.destroy);

// categories Routes (toutes protégées)
app.get("/categories", requireAuth, categoryController.index);
app.get("/categories/create", requireAuth, categoryController.create);
app.post("/categories", requireAuth, categoryController.store);
app.get("/categories/:id/edit", requireAuth, categoryController.edit);
app.post("/categories/:id/update", requireAuth, categoryController.update);
app.post("/categories/:id/delete", requireAuth, categoryController.destroy);

// Routes Transactions (toutes protégées)
app.get("/transactions", requireAuth, transactionController.index);
app.get("/transactions/create", requireAuth, transactionController.create);
app.post("/transactions", requireAuth, transactionController.store);
app.get("/transactions/:id/edit", requireAuth, transactionController.edit);
app.post("/transactions/:id/update", requireAuth, transactionController.update);
app.post("/transactions/:id/delete", requireAuth, transactionController.destroy);

// statistiques
app.get("/statistics", requireAuth, budgetController.checkBudget, statisticsController.index);

// Protected Routes
app.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'username', 'email']
    });

    res.render("dashboard", {
      title: "Tableau de bord",
      user: user
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.redirect("/login");
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render("404", {
    title: "Page non trouvée"
  });
});

// Error Handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).render("500", {
    title: "Erreur serveur",
    error: process.env.NODE_ENV === 'development' ? error : null
  });
});

// Start Server
app.listen(PORT, async () => {
  try {
    // Test database connection
    await User.sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync models (be careful with this in production)
    if (process.env.NODE_ENV !== 'production') {
      await User.sequelize.sync({ alter: true });
      console.log('Database models synchronized.');
    }

    console.log(`MoneyTrack server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
});