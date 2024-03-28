import "dotenv/config";
import { Connection, createConnection } from "mysql2/promise";
import express from "express";
import { json } from "body-parser";
import cors from "cors";

let dbConnection: Connection;
const app = express();

app.use(cors());
app.use(json());

// CRUD - Create Read Update Delete

const studentPageSize = 2; // מעמד את הנתונים שמגיעים בעמודים מסודרים
app.get("/students", async (req, res) => {
  try {
    const search = req.query.search && String(req.query.search); // עושה חיפוש בעזרת הלייק בשאילתה

    const requestedPage = Number(req.query.page);
    const offset =
      isNaN(requestedPage) || !Number.isInteger(requestedPage)
        ? 0
        : (requestedPage - 1) * studentPageSize;
    const [students] = await dbConnection.query(
      `SELECT id, firstname, lastName, email
             FROM students
             ${
               search
                 ? "WHERE firstname LIKE ? OR lastName LIKE ? OR email LIKE ?"
                 : ""
             }
             LIMIT ${studentPageSize} OFFSET ${offset}`,
      [`${search}%`, `${search}%`, `${search}%`]
    );

    res.status(200);
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500);
    res.json({ error: "something went wrong" });
  }
});

app.get("/students/:id", async (req, res) => {
  const studentId = req.params.id;

  try {
    await dbConnection.execute(
      `SELECT id, firstname, lastName, email FROM students WHERE id = ?`,
      [studentId]
    );

    res.status(200).json({ message: "Student not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/students", async (req, res) => {
  try {
    const { studentId, firstName, lastName, email } = req.body;

    const [createstudents] = await dbConnection.execute(
      `INSERT INTO students (id, firstName, lastName, email)
        VALUES (?, ?, ?, ?)`,
      [studentId ?? crypto.randomUUID, firstName, lastName, email]
    );

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
    await dbConnection.execute(`DELETE FROM students WHERE id = ?`, [
      studentId,
    ]);

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
    database: "school",
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
