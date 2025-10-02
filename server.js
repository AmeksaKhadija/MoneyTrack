const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt"); // Uncomment this
const expressLayouts = require("express-ejs-layouts");
const categoryController = require("./Controllers/categoryController");
const transactionController = require("./Controllers/transactionController");
const { User } = require("./models"); // Make sure path is correct
const authController = require("./Controllers/authController");
const budgetController = require("./Controllers/budgetController");

const app = express();
const PORT = process.env.PORT || 4000;

// EJS Configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Layouts Configuration
app.use(expressLayouts);
app.set("layout", "layout");

// Static Files
const publicPath = path.join(__dirname, "./public");
app.use(express.static(publicPath));

// Body Parsing Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "moneytrack-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
  })
);

// Authentication Middleware
const requireAuth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  try {
    // Verify user still exists in database
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      // User deleted, clear session
      req.session.destroy();
      return res.redirect("/login");
    }

    // Add user to request object for easy access
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.redirect("/login");
  }
};

// Guest middleware (redirect to dashboard if logged in)
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
        attributes: ['id', 'username', 'email'] // Don't send password
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

// Authentication Routes using controller
app.get("/register", requireGuest, authController.showRegister);
app.post("/register", requireGuest, authController.register);

app.get("/login", requireGuest, authController.showLogin);
app.post("/login", requireGuest, authController.login);

// Demo login route
app.post("/demo-login", requireGuest, authController.demoLogin);
app.post("/logout", authController.logout);

//  budget 
app.get("/budget/setup", requireAuth, budgetController.setup);
app.post("/budget/setup", requireAuth, budgetController.store);
app.get("/budget/edit", requireAuth, budgetController.edit);
app.post("/budget/update", requireAuth, budgetController.update);

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

// API Routes
app.get("/api/user", requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'username', 'email']
    });
    res.json(user);
  } catch (error) {
    console.error("API user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
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