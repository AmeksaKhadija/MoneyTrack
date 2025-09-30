const { Transaction, Category } = require('../models');
const { Op } = require('sequelize');

const transactionController = {
  // Afficher toutes les transactions
  index: async (req, res) => {
    try {
      const transactions = await Transaction.findAll({
        where: { user_id: req.session.userId },
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'category_name', 'color', 'icon']
        }],
        order: [['transaction_date', 'DESC'], ['created_at', 'DESC']]
      });

      // Calculer les statistiques
      const stats = await Transaction.findAll({
        where: { user_id: req.session.userId },
        attributes: [
          'type',
          [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total']
        ],
        group: ['type'],
        raw: true
      });

      const income = stats.find(s => s.type === 'income')?.total || 0;
      const expense = stats.find(s => s.type === 'expense')?.total || 0;
      const balance = parseFloat(income) - parseFloat(expense);

      res.render('transactions/index', {
        title: 'Mes Transactions',
        transactions,
        stats: { income, expense, balance },
        user: req.user
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.redirect('/dashboard');
    }
  },

  // Afficher le formulaire de création
  create: async (req, res) => {
    try {
      const categories = await Category.findAll({
        where: { user_id: req.session.userId },
        order: [['category_name', 'ASC']]
      });

      res.render('transactions/create', {
        title: 'Nouvelle Transaction',
        categories,
        error: null,
        user: req.user
      });
    } catch (error) {
      console.error('Error loading create form:', error);
      res.redirect('/transactions');
    }
  },

  // Sauvegarder une nouvelle transaction
  store: async (req, res) => {
    try {
      const { type, amount, description, category_id, transaction_date, notes } = req.body;

      if (!type || !amount || !description) {
        const categories = await Category.findAll({
          where: { user_id: req.session.userId },
          order: [['category_name', 'ASC']]
        });

        return res.render('transactions/create', {
          title: 'Nouvelle Transaction',
          categories,
          error: 'Le type, le montant et la description sont requis',
          user: req.user
        });
      }

      await Transaction.create({
        user_id: req.session.userId,
        type,
        amount: parseFloat(amount),
        description,
        category_id: category_id || null,
        transaction_date: transaction_date || new Date(),
        notes
      });

      res.redirect('/transactions');
    } catch (error) {
      console.error('Error creating transaction:', error);
      const categories = await Category.findAll({
        where: { user_id: req.session.userId },
        order: [['category_name', 'ASC']]
      });

      res.render('transactions/create', {
        title: 'Nouvelle Transaction',
        categories,
        error: 'Erreur lors de la création de la transaction',
        user: req.user
      });
    }
  },

  // Afficher le formulaire d'édition
  edit: async (req, res) => {
    try {
      const transaction = await Transaction.findOne({
        where: {
          id: req.params.id,
          user_id: req.session.userId
        }
      });

      if (!transaction) {
        return res.redirect('/transactions');
      }

      const categories = await Category.findAll({
        where: { user_id: req.session.userId },
        order: [['category_name', 'ASC']]
      });

      res.render('transactions/edit', {
        title: 'Modifier la Transaction',
        transaction,
        categories,
        error: null,
        user: req.user
      });
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.redirect('/transactions');
    }
  },

  // Mettre à jour une transaction
  update: async (req, res) => {
    try {
      const { type, amount, description, category_id, transaction_date, notes } = req.body;
      const transactionId = req.params.id;

      const transaction = await Transaction.findOne({
        where: {
          id: transactionId,
          user_id: req.session.userId
        }
      });

      if (!transaction) {
        return res.redirect('/transactions');
      }

      if (!type || !amount || !description) {
        const categories = await Category.findAll({
          where: { user_id: req.session.userId },
          order: [['category_name', 'ASC']]
        });

        return res.render('transactions/edit', {
          title: 'Modifier la Transaction',
          transaction,
          categories,
          error: 'Le type, le montant et la description sont requis',
          user: req.user
        });
      }

      await transaction.update({
        type,
        amount: parseFloat(amount),
        description,
        category_id: category_id || null,
        transaction_date,
        notes
      });

      res.redirect('/transactions');
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.redirect('/transactions');
    }
  },

  // Supprimer une transaction
  destroy: async (req, res) => {
    try {
      const transaction = await Transaction.findOne({
        where: {
          id: req.params.id,
          user_id: req.session.userId
        }
      });

      if (transaction) {
        await transaction.destroy();
      }

      res.redirect('/transactions');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.redirect('/transactions');
    }
  }
};

module.exports = transactionController;