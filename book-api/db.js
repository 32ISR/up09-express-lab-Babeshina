const Database = require("better-sqlite3");

const db = new Database("./database.db");

// Включаем поддержку внешних ключей
db.pragma("foreign_keys = ON");


db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        year INTEGER,
        genre TEXT,
        description TEXT,
        createdBy INTEGER NOT NULL,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bookId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
`);

function seedDatabase() {
    const bcrypt = require("bcryptjs");
    
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
    if (userCount.count > 0) {
        console.log("эти данные уже есть");
        return;
    }
    
    console.log("добавление");
    
    //админ
    const adminPassword = bcrypt.hashSync("qwerty123", 10);
    const admin = db.prepare(`
        INSERT INTO users (username, email, password, role)
        VALUES (?, ?, ?, ?)
    `).run("admin", "admin@gmail.com", adminPassword, "admin");
    
    //пользователь
    const userPassword = bcrypt.hashSync("qwerty123", 10);
    const user = db.prepare(`
        INSERT INTO users (username, email, password, role)
        VALUES (?, ?, ?, ?)
    `).run("user", "user@gmail.com", userPassword, "user");
    
    
    
    // Добавляем книги
    const books = [
        {
            title: "Никушины истории",
            author: "Ульяна бабешина",
            year: 2011,
            genre: "Драма",
            description: "описание никушиных историй",
            createdBy: admin.lastInsertRowid
        },
        {
            title: "История мема 67",
            author: "Елена Морева",
            year: 1667,
            genre: "Детектив",
            description: "описание истории мема 67",
            createdBy: admin.lastInsertRowid
        },
        {
            title: "Программирование в китэке",
            author: "Аноним",
            year: 1888,
            genre: "Эпопея",
            description: "описание программирования в китэке",
            createdBy: admin.lastInsertRowid
        },
        {
            title: "Блендер и его основы",
            author: "Наталья Кузьмина",
            year: 2024,
            genre: "Антиутопия",
            description: "описание блендера и его основ",
            createdBy: admin.lastInsertRowid
        },
        {
            title: "Воспитание дитев из опеки",
            author: "Джефри Эпштейн",
            year: 2026,
            genre: "Детектив",
            description: "описание воспитания",
            createdBy: admin.lastInsertRowid
        }
    ];
    
    const bookIds = [];
    for (const book of books) {
        const result = db.prepare(`
            INSERT INTO books (title, author, year, genre, description, createdBy)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(book.title, book.author, book.year, book.genre, book.description, book.createdBy);
        bookIds.push(result.lastInsertRowid);
    }
    
    const reviews = [
        {
            bookId: bookIds[0],
            userId: user.lastInsertRowid,
            rating: 5,
            comment: "111"
        },
        {
            bookId: bookIds[0],
            userId: user.lastInsertRowid,
            rating: 5,
            comment: "222"
        },
        {
            bookId: bookIds[1],
            userId: user.lastInsertRowid,
            rating: 5,
            comment: "333"
        },
        {
            bookId: bookIds[2],
            userId: user.lastInsertRowid,
            rating: 5,
            comment: "444"
        },
        {
            bookId: bookIds[3],
            userId: user.lastInsertRowid,
            rating: 5,
            comment: "555"
        }
    ];
    
    for (const review of reviews) {
        db.prepare(`
            INSERT INTO reviews (bookId, userId, rating, comment)
            VALUES (?, ?, ?, ?)
        `).run(review.bookId, review.userId, review.rating, review.comment);
    }
    
    console.log("тестовые данные добавлены");
    console.log("admin / qwerty123");
    console.log("user / qwerty123");
}

seedDatabase();

module.exports = db;