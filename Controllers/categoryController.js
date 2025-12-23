const { Category } = require('../models');

const categoryController = {
  // Afficher toutes les catégories de l'utilisateur
  index: async (req, res) => {
    try {
      const categories = await Category.findAll({
        where: { user_id: req.session.userId },
        order: [['created_at', 'DESC']]
      });

      res.render('categories/index', {
        title: 'Mes Catégories',
        categories,
        user: req.user
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.redirect('/dashboard');
    }
  },

  // Afficher le formulaire de création
  create: (req, res) => {
    res.render('categories/create', {
      title: 'Nouvelle Catégorie',
      error: null,
      user: req.user
    });
  },

  // Sauvegarder une nouvelle catégorie
  store: async (req, res) => {
    try {
      const { category_name, type, color, icon } = req.body;

      if (!category_name || !type) {
        return res.render('categories/create', {
          title: 'Nouvelle Catégorie',
          error: 'Le nom et le type sont requis',
          user: req.user
        });
      }

      await Category.create({
        user_id: req.session.userId,
        category_name,
        type,
        color: color || '#3b82f6',
        icon: icon || null
      });

      res.redirect('/categories');
    } catch (error) {
      console.error('Error creating category:', error);
      res.render('categories/create', {
        title: 'Nouvelle Catégorie',
        error: 'Erreur lors de la création de la catégorie',
        user: req.user
      });
    }
  },

  // Afficher le formulaire d'édition
  edit: async (req, res) => {
    try {
      const category = await Category.findOne({
        where: {
          id: req.params.id,
          user_id: req.session.userId
        }
      });

      if (!category) {
        return res.redirect('/categories');
      }

      res.render('categories/edit', {
        title: 'Modifier la Catégorie',
        category,
        error: null,
        user: req.user
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      res.redirect('/categories');
    }
  },

  // Mettre à jour une catégorie
  update: async (req, res) => {
    try {
      const { category_name, type, color, icon } = req.body;
      const categoryId = req.params.id;

      const category = await Category.findOne({
        where: {
          id: categoryId,
          user_id: req.session.userId
        }
      });

      if (!category) {
        return res.redirect('/categories');
      }

      if (!category_name || !type) {
        return res.render('categories/edit', {
          title: 'Modifier la Catégorie',
          category,
          error: 'Le nom et le type sont requis',
          user: req.user
        });
      }

      await category.update({
        category_name,
        type,
        color: color || '#3b82f6',
        icon
      });

      res.redirect('/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      res.redirect('/categories');
    }
  },

  // Supprimer une catégorie
  destroy: async (req, res) => {
    try {
      const category = await Category.findOne({
        where: {
          id: req.params.id,
          user_id: req.session.userId
        }
      });

      if (category) {
        await category.destroy();
      }

      res.redirect('/categories');
    } catch (error) {
      console.error('Error deleting category:', error);
      res.redirect('/categories');
    }
  }
};

module.exports = categoryController;