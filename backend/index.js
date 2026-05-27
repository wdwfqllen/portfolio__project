const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();

// НАСТРОЙКА ЧТЕНИЯ ДАННЫХ
app.use(express.json()); // Включаем чтение JSON-данных
app.use(express.urlencoded({ extended: true })); // <-- ДОБАВИЛИ: теперь сервер понимает данные из HTML-форм!

// Подключение к PostgreSQL
const sequelize = new Sequelize('postgres://postgres:wdwfqllen040808naa@localhost:5432/my_database', {
                dialect: 'postgres',
                logging: false
});

// Описание таблицы (Модель ORM)
// ОБНОВИЛИ: Добавили все поля, которые есть в твоей HTML-форме
const User = sequelize.define('User', {
                email: {
                                type: DataTypes.STRING,
                                allowNull: false,
                                unique: true
                },
                telegram: {
                                type: DataTypes.STRING,
                                allowNull: true // поле необязательное, так как в HTML нет звездочки *
                },
                courses: {
                                type: DataTypes.STRING,
                                allowNull: false // тема обязательна *
                },
                comment: {
                                type: DataTypes.TEXT, // TEXT лучше подходит для длинных комментариев, чем STRING
                                allowNull: true
                }
});

// Маршрут для создания пользователя (POST)
app.post('/users', async (req, res) => {
                try {
                                // Браузер пришлет данные вот сюда в req.body
                                const { email, telegram, courses, comment } = req.body;

                                // Создание записи в базе через Sequelize
                                const newUser = await User.create({
                                                email,
                                                telegram,
                                                courses,
                                                comment
                                });

                                // Ответ, который ты увидишь в браузере после успешной отправки
                                res.status(201).send('<h1>Успех!</h1><p>Данные успешно записаны в базу данных PostgreSQL.</p><a href="http://127.0.0.1:5500/form/index.html">Вернуться к форме</a>');
                } catch (error) {
                                res.status(500).send("Ошибка при сохранении: " + error.message);
                }
});

// Маршрут для получения всех пользователей (GET)
app.get('/users', async (req, res) => {
                try {
                                const users = await User.findAll();
                                res.json(users);
                } catch (error) {
                                res.status(500).json({ error: error.message });
                }
});

// Функция запуска
async function startServer() {
                try {
                                await sequelize.authenticate();
                                console.log('✅ База данных успешно подключена.');

                                // { alter: true } автоматически пересоздаст/добавит новые колонки (telegram, courses, comment) в твою таблицу
                                await sequelize.sync({ alter: true });
                                console.log('🔄 Таблицы в БД обновлены.');

                                const PORT = 3000;
                                app.listen(PORT, () => {
                                                console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
                                });
                } catch (error) {
                                console.error('❌ Ошибка запуска сервера:', error);
                }
}

startServer();