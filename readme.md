# Guide d'Installation - MoneyTrack

Application web de gestion de budget personnel avec Node.js, Express, MySQL et Sequelize.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 14 ou supérieure) - [Télécharger](https://nodejs.org/)
- **MySQL** (version 5.7 ou supérieure) - [Télécharger](https://dev.mysql.com/downloads/mysql/)
- **Git** (optionnel) - [Télécharger](https://git-scm.com/)
- Un éditeur de code (VS Code recommandé)

## Installation

### 1. Cloner ou télécharger le projet

```bash
# Avec Git
git clone <url-du-repo>
cd MoneyTrack

# OU téléchargez le ZIP et décompressez-le
```

### 2. Installer les dépendances Node.js

```bash
npm install
```

Cette commande installe automatiquement :
- express
- ejs
- express-ejs-layouts
- express-session
- bcrypt
- sequelize
- mysql2

### 3. Configuration de la base de données

#### 3.1 Créer la base de données MySQL

Connectez-vous à MySQL :

```bash
mysql -u root -p
```

Créez la base de données :

```sql
CREATE DATABASE moneytrack_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 3.2 Configurer les paramètres de connexion

Modifiez le fichier `config/config.json` avec vos identifiants MySQL :

```json
{
  "development": {
    "username": "votre_username_mysql",
    "password": "votre_password_mysql",
    "database": "moneytrack_dev",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "port": 3306
  }
}
```

#### 3.3 Créer un fichier .env (optionnel mais recommandé)

Créez un fichier `.env` à la racine du projet :

```env
NODE_ENV=development
SESSION_SECRET=votre-cle-secrete-super-longue-et-aleatoire
DB_NAME=moneytrack_dev
DB_USER=votre_username
DB_PASS=votre_password
DB_HOST=localhost
DB_PORT=3306
PORT=4000
```

### 4. Structure des dossiers

Vérifiez que vous avez cette structure :

```
MoneyTrack/
├── Controllers/
│   ├── authController.js
│   ├── budgetController.js
│   ├── categoryController.js
│   ├── transactionController.js
│   └── savingController.js
├── models/
│   ├── index.js
│   ├── user.js
│   ├── budget.js
│   ├── category.js
│   ├── transaction.js
│   └── saving.js
├── views/
│   ├── budget/
│   │   ├── setup.ejs
│   │   └── edit.ejs
│   ├── categories/
│   │   ├── index.ejs
│   │   ├── create.ejs
│   │   └── edit.ejs
│   ├── transactions/
│   │   ├── index.ejs
│   │   ├── create.ejs
│   │   └── edit.ejs
│   ├── savings/
│   │   ├── index.ejs
│   │   └── create.ejs
│   ├── layout.ejs
│   ├── index.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── dashboard.ejs
│   └── 404.ejs
├── public/
│   └── css/
│       └── style.css
├── config/
│   └── config.json
├── node_modules/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

### 5. Synchroniser la base de données

Au premier démarrage, Sequelize créera automatiquement les tables. Lancez :

```bash
npm start
```

Si tout est correct, vous verrez :

```
Database connection established successfully.
Database models synchronized.
MoneyTrack server is running on http://localhost:4000
Environment: development
```

## Démarrage

### Démarrage normal

```bash
npm start
```

### Démarrage en mode développement (avec auto-reload)

Installez nodemon globalement ou localement :

```bash
npm install -g nodemon
# OU
npm install --save-dev nodemon
```

Ajoutez dans `package.json` :

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

Puis lancez :

```bash
npm run dev
```

## Accès à l'application

Ouvrez votre navigateur et accédez à :

```
http://localhost:4000
```

## Premier utilisateur

1. Cliquez sur **S'inscrire**
2. Remplissez le formulaire d'inscription
3. Vous serez redirigé vers la configuration du budget initial
4. Entrez votre solde de départ
5. Commencez à utiliser l'application

## Compte de démonstration

Un compte de démonstration est créé automatiquement :

- **Email**: demo@moneytrack.com
- **Mot de passe**: demo123

Cliquez sur "Connexion directe (Démo)" sur la page de connexion.

## Dépannage

### Erreur de connexion à la base de données

**Problème** : `Unable to connect to the database`

**Solutions** :
1. Vérifiez que MySQL est démarré
2. Vérifiez les identifiants dans `config/config.json`
3. Vérifiez que la base de données existe
4. Vérifiez que le port 3306 est correct

### Port 4000 déjà utilisé

**Problème** : `EADDRINUSE: address already in use`

**Solution** : Changez le port dans `.env` ou `server.js` :

```javascript
const PORT = process.env.PORT || 5000;
```

### Erreur "Cannot find module"

**Problème** : Module introuvable

**Solution** : Réinstallez les dépendances :

```bash
rm -rf node_modules package-lock.json
npm install
```

### Tables non créées

**Problème** : Les tables n'existent pas dans la base de données

**Solution** : Sequelize créera les tables au démarrage. Assurez-vous que :
- `sync({ alter: true })` est dans server.js
- L'environnement est en développement

Si problème persiste, créez les tables manuellement avec les migrations Sequelize.

## Variables d'environnement

Créez un fichier `.env` avec :

```env
NODE_ENV=development
SESSION_SECRET=changez-cette-cle-secrete-en-production
DB_NAME=moneytrack_dev
DB_USER=root
DB_PASS=votre_password
DB_HOST=localhost
DB_PORT=3306
PORT=4000
```

## Sécurité

⚠️ **Important pour la production** :

1. Changez `SESSION_SECRET` dans `.env`
2. Activez HTTPS et mettez `cookie: { secure: true }`
3. Utilisez des variables d'environnement pour les mots de passe
4. N'exposez jamais votre fichier `.env`
5. Désactivez `sync({ alter: true })` en production
6. Utilisez un store de session (Redis, MongoDB)

## Support

Pour toute question ou problème :
- Consultez la documentation complète dans `DOCUMENTATION.md`
- Vérifiez les logs dans la console
- Utilisez les outils de développement du navigateur (F12)

## Prochaines étapes

Une fois l'installation terminée :
1. Lisez `DOCUMENTATION.md` pour comprendre l'architecture
2. Créez vos catégories de revenus et dépenses
3. Ajoutez vos premières transactions
4. Définissez vos objectifs d'épargne
5. Suivez votre progression financière

---

**Version**: 1.0.0  
**Dernière mise à jour**: Octobre 2025