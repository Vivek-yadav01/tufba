import dotenv from "dotenv";

dotenv.config();
import express from "express";
import cors from "cors";
import mysql from "mysql2";

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON bodies

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database!");
});

// Route to create a table
app.get("/create-table", (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS bookBank (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ques VARCHAR(255),
      ans VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error creating table:", err);
      res.status(500).send("Server error");
      return;
    }
    res.send("Table created successfully");
  });
});

// GET route - retrieve data
app.get("/data", (req, res) => {
  const sql = "SELECT * FROM bookBank";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Server error");
      return;
    }
    res.json(result);
  });
});

// POST route - insert data
app.post("/data", (req, res) => {
  const { ques, ans } = req.body;

  // Validate input to ensure it's not empty or null
  if (!ques || !ans) {
    return res.status(400).send("Question and answer are required.");
  }

  const sql = "INSERT INTO bookBank (ques, ans) VALUES (?, ?)";
  db.query(sql, [ques, ans], (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).send("Server error");
    }
    res.status(201).send("Data inserted successfully");
  });
});
// PUT route - for updating data
app.put("/data/:id", (req, res) => {
  const { id } = req.params;
  const { ques, ans } = req.body;

  // Validate input to ensure it's not empty or null
  if (!ques || !ans) {
    return res.status(400).send("Question and answer are required.");
  }

  // Ensure ID is provided
  if (!id) {
    return res.status(400).send("ID is required.");
  }

  // SQL query to update the record
  const sql = "UPDATE bookBank SET ques = ?, ans = ? WHERE id = ?";
  db.query(sql, [ques, ans, id], (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).send("Server error");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Record not found.");
    }
    res.status(200).send("Data updated successfully");
  });
});

// DELETE route - delete data
app.delete("/data/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM bookBank WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Server error");
      return;
    }
    res.send("Data deleted successfully");
  });
});

// Start the server
const port = process.env.PORT;
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
