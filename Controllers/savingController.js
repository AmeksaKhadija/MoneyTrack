const { Saving } = require('../models');
const budgetController = require('./budgetController');

const savingController = {
    // Afficher toutes les épargnes
    index: async (req, res) => {
        try {
            const savings = await Saving.findAll({
                where: { user_id: req.session.userId },
                order: [['created_at', 'DESC']]
            });

            // Calculer les statistiques
            const stats = await budgetController.calculateStats(req.session.userId);

            // Calculer le total épargné
            const totalSaved = savings.reduce((sum, s) => sum + parseFloat(s.saved_amount), 0);
            const totalGoals = savings.reduce((sum, s) => sum + parseFloat(s.goal_amount), 0);

            // Récupérer les messages de session
            const savingSuccess = req.session.savingSuccess;
            const savingError = req.session.savingError;
            delete req.session.savingSuccess;
            delete req.session.savingError;

            res.render('savings/index', {
                title: 'Mes Épargnes',
                savings,
                stats,
                totalSaved,
                totalGoals,
                savingSuccess,
                savingError,
                user: req.user
            });
        } catch (error) {
            console.error('Error fetching savings:', error);
            res.redirect('/dashboard');
        }
    },

    // Afficher le formulaire de création
    create: (req, res) => {
        res.render('savings/create', {
            title: 'Nouvelle Épargne',
            error: null,
            user: req.user
        });
    },

    // Sauvegarder une nouvelle épargne
    store: async (req, res) => {
        try {
            const { goal_name, goal_amount, target_date, description } = req.body;

            if (!goal_name || !goal_amount) {
                return res.render('savings/create', {
                    title: 'Nouvelle Épargne',
                    error: 'Le nom et le montant objectif sont requis',
                    user: req.user
                });
            }

            await Saving.create({
                user_id: req.session.userId,
                goal_name,
                goal_amount: parseFloat(goal_amount),
                saved_amount: 0,
                target_date: target_date || null,
                description
            });

            res.redirect('/savings');
        } catch (error) {
            console.error('Error creating saving:', error);
            res.render('savings/create', {
                title: 'Nouvelle Épargne',
                error: 'Erreur lors de la création de l\'épargne',
                user: req.user
            });
        }
    },

    // Ajouter de l'argent à une épargne
    addMoney: async (req, res) => {
        try {
            const { amount } = req.body;
            const savingId = req.params.id;

            const saving = await Saving.findOne({
                where: {
                    id: savingId,
                    user_id: req.session.userId
                }
            });

            if (!saving) {
                return res.redirect('/savings');
            }

            const addAmount = parseFloat(amount);

            if (!addAmount || addAmount <= 0) {
                req.session.savingError = 'Le montant doit être supérieur à zéro';
                return res.redirect('/savings');
            }

            // Vérifier si l'utilisateur a assez d'argent
            const stats = await budgetController.calculateStats(req.session.userId);

            if (stats.currentBalance < addAmount) {
                req.session.savingError = `Solde insuffisant ! Vous avez €${stats.currentBalance.toFixed(2)} mais vous voulez épargner €${addAmount.toFixed(2)}`;
                return res.redirect('/savings');
            }

            // Calculer le nouveau montant épargné
            const newSavedAmount = parseFloat(saving.saved_amount) + addAmount;

            // Vérifier si on ne dépasse pas l'objectif
            if (newSavedAmount > parseFloat(saving.goal_amount)) {
                req.session.savingError = `Vous ne pouvez pas épargner plus que votre objectif de €${parseFloat(saving.goal_amount).toFixed(2)}`;
                return res.redirect('/savings');
            }

            await saving.update({
                saved_amount: newSavedAmount
            });

            req.session.savingSuccess = `€${addAmount.toFixed(2)} ajouté avec succès à votre épargne "${saving.goal_name}"`;
            res.redirect('/savings');
        } catch (error) {
            console.error('Error adding money to saving:', error);
            res.redirect('/savings');
        }
    },

    // Retirer de l'argent d'une épargne
    withdrawMoney: async (req, res) => {
        try {
            const { amount } = req.body;
            const savingId = req.params.id;

            const saving = await Saving.findOne({
                where: {
                    id: savingId,
                    user_id: req.session.userId
                }
            });

            if (!saving) {
                return res.redirect('/savings');
            }

            const withdrawAmount = parseFloat(amount);

            if (!withdrawAmount || withdrawAmount <= 0) {
                req.session.savingError = 'Le montant doit être supérieur à zéro';
                return res.redirect('/savings');
            }

            if (withdrawAmount > parseFloat(saving.saved_amount)) {
                req.session.savingError = `Vous ne pouvez pas retirer plus que €${parseFloat(saving.saved_amount).toFixed(2)}`;
                return res.redirect('/savings');
            }

            const newSavedAmount = parseFloat(saving.saved_amount) - withdrawAmount;

            await saving.update({
                saved_amount: newSavedAmount
            });

            req.session.savingSuccess = `€${withdrawAmount.toFixed(2)} retiré avec succès de votre épargne "${saving.goal_name}"`;
            res.redirect('/savings');
        } catch (error) {
            console.error('Error withdrawing money from saving:', error);
            res.redirect('/savings');
        }
    },

    // Supprimer une épargne
    destroy: async (req, res) => {
        try {
            const saving = await Saving.findOne({
                where: {
                    id: req.params.id,
                    user_id: req.session.userId
                }
            });

            if (saving) {
                await saving.destroy();
                req.session.savingSuccess = 'Épargne supprimée avec succès';
            }

            res.redirect('/savings');
        } catch (error) {
            console.error('Error deleting saving:', error);
            res.redirect('/savings');
        }
    }
};

module.exports = savingController;