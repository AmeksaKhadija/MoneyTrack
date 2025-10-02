const bcrypt = require('bcrypt');
const { User } = require('../models');

const authController = {
  showRegister: (req, res) => {
    if (req.session.userId) {
      return res.redirect('/dashboard');
    }
    res.render('register', {
      title: 'Inscription - MoneyTrack',
      error: null,
      user: null
    });
  },

  register: async (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body;

      // Validation
      if (!name || !email || !password || !confirmPassword) {
        return res.render('register', {
          title: 'Inscription - MoneyTrack',
          error: 'Tous les champs sont requis',
          user: null
        });
      }

      if (password !== confirmPassword) {
        return res.render('register', {
          title: 'Inscription - MoneyTrack',
          error: 'Les mots de passe ne correspondent pas',
          user: null
        });
      }

      if (password.length < 6) {
        return res.render('register', {
          title: 'Inscription - MoneyTrack',
          error: 'Le mot de passe doit contenir au moins 6 caractères',
          user: null
        });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.render('register', {
          title: 'Inscription - MoneyTrack',
          error: 'Un compte avec cet email existe déjà',
          user: null
        });
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = await User.create({
        username: name,
        email,
        password: hashedPassword
      });

      // console.log('New user created:', { id: newUser.id, username: newUser.username, email: newUser.email });
      req.session.successMessage = 'Compte créé avec succès! Veuillez vous connecter.';
      req.session.userId = newUser.id;
      req.session.userEmail = newUser.email;
      req.session.userName = newUser.username;

      res.redirect('/budget/setup');

    } catch (error) {
      console.error('Registration error:', error);

      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => err.message);
        return res.render('register', {
          title: 'Inscription - MoneyTrack',
          error: validationErrors.join(', '),
          user: null
        });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.render('register', {
          title: 'Inscription - MoneyTrack',
          error: 'Un compte avec cet email existe déjà',
          user: null
        });
      }

      res.render('register', {
        title: 'Inscription - MoneyTrack',
        error: 'Erreur lors de la création du compte. Veuillez réessayer.',
        user: null
      });
    }
  },

  // login
  showLogin: (req, res) => {
    if (req.session.userId) {
      return res.redirect('/dashboard');
    }

    const successMessage = req.session.successMessage;
    delete req.session.successMessage;

    res.render('login', {
      title: 'Connexion - MoneyTrack',
      error: null,
      success: successMessage || null,
      user: null
    });
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.render('login', {
          title: 'Connexion - MoneyTrack',
          error: 'Email et mot de passe requis',
          success: null,
          user: null
        });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.render('login', {
          title: 'Connexion - MoneyTrack',
          error: 'Email ou mot de passe incorrect',
          success: null,
          user: null
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.render('login', {
          title: 'Connexion - MoneyTrack',
          error: 'Email ou mot de passe incorrect',
          success: null,
          user: null
        });
      }

      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.userName = user.username;

      // console.log('User logged in:', { id: user.id, username: user.username, email: user.email });

      res.redirect('/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      res.render('login', {
        title: 'Connexion - MoneyTrack',
        error: 'Erreur lors de la connexion. Veuillez réessayer.',
        success: null,
        user: null
      });
    }
  },

  // logout
  logout: (req, res) => {
    const userId = req.session.userId;
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.redirect('/dashboard');
      }

      console.log('User logged out:', userId);
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  },


  demoLogin: async (req, res) => {
    try {
      let demoUser = await User.findOne({ where: { email: 'demo@moneytrack.com' } });

      if (!demoUser) {
        const hashedPassword = await bcrypt.hash('demo123', 12);
        demoUser = await User.create({
          username: 'Utilisateur Démo',
          email: 'demo@moneytrack.com',
          password: hashedPassword
        });
        console.log('Demo user created');
      }

      req.session.userId = demoUser.id;
      req.session.userEmail = demoUser.email;
      req.session.userName = demoUser.username;

      console.log('Demo user logged in');

      res.redirect('/dashboard');

    } catch (error) {
      console.error('Demo login error:', error);
      res.render('login', {
        title: 'Connexion - MoneyTrack',
        error: 'Erreur lors de la connexion avec le compte démo',
        success: null,
        user: null
      });
    }
  }
};

module.exports = authController;