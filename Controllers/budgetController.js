const { Budget, Transaction } = require('../models');
const { Op } = require('sequelize');

const budgetController = {
  // Vérifier si l'utilisateur a un budget initial
  checkBudget: async (req, res, next) => {
    try {
      const budget = await Budget.findOne({
        where: { user_id: req.session.userId }
      });

      if (!budget) {
        return res.redirect('/budget/setup');
      }

      next();
    } catch (error) {
      console.error('Error checking budget:', error);
      res.redirect('/dashboard');
    }
  },

  // Afficher le formulaire de configuration du budget initial
  setup: async (req, res) => {
    try {
      // Vérifier si l'utilisateur a déjà un budget
      const existingBudget = await Budget.findOne({
        where: { user_id: req.session.userId }
      });

      if (existingBudget) {
        return res.redirect('/budget/edit');
      }

      res.render('budget/setup', {
        title: 'Configuration du Budget Initial',
        error: null,
        user: req.user
      });
    } catch (error) {
      console.error('Error loading budget setup:', error);
      res.redirect('/dashboard');
    }
  },

  // Sauvegarder le budget initial
  store: async (req, res) => {
    try {
      const { initial_balance } = req.body;

      if (!initial_balance || parseFloat(initial_balance) < 0) {
        return res.render('budget/setup', {
          title: 'Configuration du Budget Initial',
          error: 'Le solde initial doit être un montant valide',
          user: req.user
        });
      }

      await Budget.create({
        user_id: req.session.userId,
        initial_balance: parseFloat(initial_balance),
        current_date: new Date()
      });

      res.redirect('/transactions');
    } catch (error) {
      console.error('Error creating budget:', error);
      res.render('budget/setup', {
        title: 'Configuration du Budget Initial',
        error: 'Erreur lors de la configuration du budget',
        user: req.user
      });
    }
  },

  // Afficher/Modifier le budget
  edit: async (req, res) => {
    try {
      const budget = await Budget.findOne({
        where: { user_id: req.session.userId }
      });

      if (!budget) {
        return res.redirect('/budget/setup');
      }

      res.render('budget/edit', {
        title: 'Modifier le Budget Initial',
        budget,
        error: null,
        user: req.user
      });
    } catch (error) {
      console.error('Error loading budget:', error);
      res.redirect('/dashboard');
    }
  },

  // Mettre à jour le budget
  update: async (req, res) => {
    try {
      const { initial_balance } = req.body;
      
      const budget = await Budget.findOne({
        where: { user_id: req.session.userId }
      });

      if (!budget) {
        return res.redirect('/budget/setup');
      }

      if (!initial_balance || parseFloat(initial_balance) < 0) {
        return res.render('budget/edit', {
          title: 'Modifier le Budget Initial',
          budget,
          error: 'Le solde initial doit être un montant valide',
          user: req.user
        });
      }

      await budget.update({
        initial_balance: parseFloat(initial_balance)
      });

      res.redirect('/transactions');
    } catch (error) {
      console.error('Error updating budget:', error);
      res.redirect('/budget/edit');
    }
  },

  // Calculer les statistiques réelles
  calculateStats: async (userId) => {
    try {
      // Récupérer le budget initial
      const budget = await Budget.findOne({
        where: { user_id: userId }
      });

      // Calculer les totaux des transactions
      const stats = await Transaction.findAll({
        where: { user_id: userId },
        attributes: [
          'type',
          [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total']
        ],
        group: ['type'],
        raw: true
      });

      const income = parseFloat(stats.find(s => s.type === 'income')?.total || 0);
      const expense = parseFloat(stats.find(s => s.type === 'expense')?.total || 0);
      const initialBalance = budget ? parseFloat(budget.initial_balance) : 0;
      
      // Solde = Budget Initial + Revenus - Dépenses
      const currentBalance = initialBalance + income - expense;

      return {
        initialBalance,
        income,
        expense,
        currentBalance
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        initialBalance: 0,
        income: 0,
        expense: 0,
        currentBalance: 0
      };
    }
  }
};

module.exports = budgetController;