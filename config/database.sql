create table users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
);

create table budgets(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    month_year VARCHAR(7), -- "2025-09"
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
npx sequelize-cli model:generate --name Transaction --attributes user_id:integer,category_id:integer,amount:decimal,type:enum:{income,expense},transaction_date:date,description:text


create table categories(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category_name VARCHAR(255) NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

create table transactions(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
);

create table savings(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    goal_name VARCHAR(255),
    goal_amount DECIMAL(10, 2) NOT NULL,
    saved_amount DECIMAL(10, 2) DEFAULT 0,
    target_date DATE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

