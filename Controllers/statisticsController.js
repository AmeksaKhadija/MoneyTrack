const { Transaction, Category } = require('../models');
const budgetController = require('./budgetController');
const { Op } = require('sequelize');

const statisticsController = {
    index: async (req, res) => {
        try {
            const userId = req.session.userId;

            // 1. Statistiques globales
            const stats = await budgetController.calculateStats(userId);

            // 2. Compter les transactions par type
            const transactionCounts = await Transaction.findAll({
                where: { user_id: userId },
                attributes: [
                    'type',
                    [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('id')), 'count']
                ],
                group: ['type'],
                raw: true
            });

            stats.totalTransactions = transactionCounts.reduce((sum, t) => sum + parseInt(t.count), 0);
            stats.incomeCount = transactionCounts.find(t => t.type === 'income')?.count || 0;
            stats.expenseCount = transactionCounts.find(t => t.type === 'expense')?.count || 0;

            // 3. Données mensuelles (6 derniers mois)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const monthlyTransactions = await Transaction.findAll({
                where: {
                    user_id: userId,
                    transaction_date: {
                        [Op.gte]: sixMonthsAgo
                    }
                },
                attributes: [
                    [Transaction.sequelize.fn('DATE_FORMAT', Transaction.sequelize.col('transaction_date'), '%Y-%m'), 'month'],
                    'type',
                    [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total']
                ],
                group: ['month', 'type'],
                order: [['month', 'ASC']],
                raw: true
            });

            // Formater les données mensuelles
            const monthsMap = {};
            monthlyTransactions.forEach(t => {
                if (!monthsMap[t.month]) {
                    monthsMap[t.month] = { month: t.month, income: 0, expense: 0 };
                }
                if (t.type === 'income') {
                    monthsMap[t.month].income = parseFloat(t.total);
                } else {
                    monthsMap[t.month].expense = parseFloat(t.total);
                }
            });

            const monthlyData = Object.values(monthsMap).map(m => ({
                month: new Date(m.month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
                income: m.income,
                expense: m.expense
            }));

            // 4. Statistiques par catégorie
            const categoryTransactions = await Transaction.findAll({
                where: { user_id: userId },
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'category_name', 'type', 'color', 'icon']
                }],
                attributes: [
                    'category_id',
                    'type',
                    [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('Transaction.id')), 'count'],
                    [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total']
                ],
                group: ['category_id', 'type'],
                raw: true
            });

            // Catégories sans transactions (catégorie NULL)
            const noCategory = categoryTransactions.filter(t => !t.category_id);

            // Catégories avec transactions
            const categoriesWithData = await Category.findAll({
                where: { user_id: userId },
                raw: true
            });

            const categoryStats = [];

            // Ajouter les catégories avec données
            categoriesWithData.forEach(cat => {
                const catData = categoryTransactions.find(t => t.category_id === cat.id);
                if (catData) {
                    categoryStats.push({
                        id: cat.id,
                        name: cat.category_name,
                        type: cat.type,
                        color: cat.color,
                        icon: cat.icon,
                        count: parseInt(catData.count),
                        total: parseFloat(catData.total)
                    });
                }
            });

            // Ajouter "Sans catégorie" si nécessaire
            if (noCategory.length > 0) {
                noCategory.forEach(nc => {
                    categoryStats.push({
                        id: null,
                        name: 'Sans catégorie',
                        type: nc.type,
                        color: '#6c757d',
                        icon: '📋',
                        count: parseInt(nc.count),
                        total: parseFloat(nc.total)
                    });
                });
            }

            // Calculer les pourcentages
            const totalAmount = categoryStats.reduce((sum, c) => sum + c.total, 0);
            categoryStats.forEach(c => {
                c.percentage = totalAmount > 0 ? (c.total / totalAmount) * 100 : 0;
            });

            // Trier par montant décroissant
            categoryStats.sort((a, b) => b.total - a.total);

            // Rendre la vue
            res.render('statistics', {
                title: 'Statistiques',
                user: req.user,
                stats,
                monthlyData,
                categoryStats
            });

        } catch (error) {
            console.error('Error fetching statistics:', error);
            res.redirect('/dashboard');
        }
    }
};

module.exports = statisticsController;