const express = require("express")
const path = require("path")
const session = require("express-session")
// const bcrypt = require("bcrypt")
const expressLayouts = require("express-ejs-layouts")
const app = express()
const PORT = 4000

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(expressLayouts)
app.set("layout", "layout")

const publicPath = path.join(__dirname, "./public")
app.use(express.static(publicPath))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(
  session({
    secret: "moneytrack-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
)

const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next()
  } else {
    res.redirect("/login")
  }
}

const users = []
let nextUserId = 1

app.get("/", (req, res) => {
  const user = req.session.userId ? users.find(u => u.id === req.session.userId) : null;
  res.render("index", { title: "Accueil", user });
});

app.get("/register", (req, res) => {
  // const user = req.session.userId ? users.find(u => u.id === req.session.userId) : null;
  res.render("register", { title: "Register", error: null })
})

app.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body

  if (!name || !email || !password || !confirmPassword) {
    return res.render("register", { error: "Tous les champs sont requis" })
  }

  if (password !== confirmPassword) {
    return res.render("register", { error: "Les mots de passe ne correspondent pas" })
  }

  if (users.find((u) => u.email === email)) {
    return res.render("register", { error: "Un compte avec cet email existe déjà" })
  }

  try {
    // Hacher le mot de passe
    // const hashedPassword = await bcrypt.hash(password, 10)

    // Créer le nouvel utilisateur
    const newUser = {
      id: nextUserId++,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    }

    users.push(newUser)

    req.session.userId = newUser.id

    res.redirect("/dashboard")
  } catch (error) {
    res.render("register", { error: "Erreur lors de la création du compte" })
  }
})

app.get("/login", (req, res) => {
  res.render("login", { title: "Login", error: null })
})

// Route de connexion - POST
app.post("/login", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.render("login", { error: "Email et mot de passe requis" })
  }

  // Trouver l'utilisateur
  const user = users.find((u) => u.email === email)

  if (!user) {
    return res.render("login", { error: "Email ou mot de passe incorrect" })
  }

  try {
    // Vérifier le mot de passe
    // const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.render("login", { error: "Email ou mot de passe incorrect" })
    }

    // Connecter l'utilisateur
    req.session.userId = user.id

    res.redirect("/dashboard")
  } catch (error) {
    res.render("login", { error: "Erreur lors de la connexion" })
  }
})

// Route de déconnexion
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erreur lors de la déconnexion:", err)
    }
    res.redirect("/")
  })
})

// Route du tableau de bord (protégée)
app.get("/dashboard", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.session.userId)
  res.render("dashboard", { user })
})

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).render("404")
})

app.listen(PORT, () => {
  console.log(`MoneyTrack server is running on http://localhost:${PORT}`)
})
