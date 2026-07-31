import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Initialize tables
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                savings_goal REAL
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                date TEXT,
                earnings REAL,
                hours REAL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS fare_benchmarks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                city TEXT,
                service_type TEXT,
                fair_rate_per_km REAL,
                min_base_pay REAL
            )`);

             // Insert sample benchmarks
            db.get("SELECT count(*) as count FROM fare_benchmarks", (err, row) => {
                if (row && row.count === 0) {
                    db.run("INSERT INTO fare_benchmarks (city, service_type, fair_rate_per_km, min_base_pay) VALUES ('Bangalore', 'Food Delivery (Reddit Standard)', 12.0, 20)");
                    db.run("INSERT INTO fare_benchmarks (city, service_type, fair_rate_per_km, min_base_pay) VALUES ('Bangalore', 'Ride Hail (Reddit Standard)', 18.0, 50)");
                    db.run("INSERT INTO fare_benchmarks (city, service_type, fair_rate_per_km, min_base_pay) VALUES ('Mumbai', 'Food Delivery (Reddit Standard)', 15.0, 35)");
                    db.run("INSERT INTO fare_benchmarks (city, service_type, fair_rate_per_km, min_base_pay) VALUES ('Bangalore', 'Rain Surge Peak Hour', 20.0, 45)");
                    db.run("INSERT INTO fare_benchmarks (city, service_type, fair_rate_per_km, min_base_pay) VALUES ('Bangalore', 'Late Night Fuel Allowance', 16.0, 30)");
                }
            });

            // Insert a dummy user if none exists
            db.get("SELECT * FROM users WHERE username = 'demo'", (err, row) => {
                if (!row) {
                    db.run("INSERT INTO users (username, password, savings_goal) VALUES ('demo', 'password', 500)");
                    
                    const today = new Date();
                    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
                    const lastWeek = new Date(today); lastWeek.setDate(lastWeek.getDate() - 7);
                    const lastMonth = new Date(today); lastMonth.setMonth(lastMonth.getMonth() - 1);

                    const formatDate = (d) => d.toISOString().split('T')[0];

                    db.run(`INSERT INTO jobs (user_id, date, earnings, hours) VALUES (1, '${formatDate(today)}', 150, 5)`);
                    db.run(`INSERT INTO jobs (user_id, date, earnings, hours) VALUES (1, '${formatDate(yesterday)}', 120, 4)`);
                    db.run(`INSERT INTO jobs (user_id, date, earnings, hours) VALUES (1, '${formatDate(lastWeek)}', 600, 20)`);
                    db.run(`INSERT INTO jobs (user_id, date, earnings, hours) VALUES (1, '${formatDate(lastMonth)}', 2000, 80)`);
                }
            });
        });
    }
});

export default db;
