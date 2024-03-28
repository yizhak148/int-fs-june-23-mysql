import "dotenv/config";
import "body-parser";

import { Connection, createConnection } from "mysql2/promise";
import express from "express";

let dbConnection: Connection;
const app = express();

// CRUD - Create Read Update Delete
console.log("hi");

app.get("/students", async (req, res) => {
    try {
        const [students] = await dbConnection.execute("SELECT id, firstname, lastName, email FROM students");

        res.status(200);
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500);
        res.json({ error: "something went wrong" });
    }
});

app.get("/students/:id", async (req, res) => { });

app.post("/students", async (req, res) => {

    try {
        const {studentId, firstName, lastName, email } = req.body;

        const [createstudents] = await dbConnection.execute(`INSERT INTO students (id, firstName, lastName, email)
        VALUES (?, ?, ?, ?)`,
        [studentId ?? crypto.randomUUID, firstName, lastName, email]);

        res.status(200);
        res.json(createstudents);
    } catch (err) {
        console.error(err);
        res.status(500);
        res.json({ error: "something went wrong" });
    }
 });

app.put("/students/:id", async (req, res) => { 
    const studentId = req.params.id;
    const { firstName, lastName, email } = req.body;

    try {
        await dbConnection.execute(
            `UPDATE students SET firstName = ?, lastName = ?, email = ? WHERE id = ?`,
            [firstName, lastName, email, studentId]
        );

        res.status(200).json({ message: "Student updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });

    }
});

app.delete("/students/:id", async (req, res) => {
    const studentId = req.params.id;
    try {
        await dbConnection.execute(
            `DELETE FROM students WHERE id = ?`, [studentId]
        );

        res.status(200).json({ message: "Student deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });

    }
 });

async function runApp() {
    dbConnection = await createConnection({
        host: "localhost",
        user: "root",
        password: process.env.DB_PASSWORD,
        database: "school"
    });

    try {
        app.listen(3000, () => console.log("app is running on localhost:3000"));
    } catch (err) {
        dbConnection.end();
        throw err;
    }
}

process.on("uncaughtException", () => dbConnection.end());
process.on("unhandledRejection", () => dbConnection.end());

// process.on("uncaughtException", () => {
//     if (dbConnection) {
//         dbConnection.end();
//     }
// });
// process.on("unhandledRejection", () => {
//     if (dbConnection) {
//         dbConnection.end();
//     }
// });
runApp();
