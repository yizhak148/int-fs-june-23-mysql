import "dotenv/config";

import { createConnection } from "mysql2/promise";

async function app() {
    const connection = await createConnection({
        host: "localhost",
        user: "root",
        password: process.env.DB_PASSWORD,
        database: "school"
    });

    try {
        const [rows] = await connection.query("SELECT * FROM students");

        console.log(rows);
    } catch (err) {
        console.error(err);
    } finally {
        connection.end();
    }
}

app();
