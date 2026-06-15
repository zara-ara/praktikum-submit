require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const upload = multer({
    dest: "uploads/"
});

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log("Azure MySQL Connected 🚀");
});

app.get("/", (req, res) => {
    res.render("submit");
});

app.post("/submit", upload.single("file"), (req, res) => {

    const {
        nim,
        name,
        class: kelas,
        course
    } = req.body;

    const fileName = req.file
        ? req.file.originalname
        : "";

    const sql = `
        INSERT INTO submissions
        (nim,name,class,course,file_url,status)
        VALUES
        (?,?,?,?,?,'Submitted')
    `;

    db.query(
        sql,
        [nim, name, kelas, course, fileName],
        (err) => {

            if (err) {
                console.log(err);
                return;
            }

            res.redirect("/list");
        }
    );

});

app.get("/list", (req, res) => {

    db.query(
        "SELECT * FROM submissions ORDER BY id DESC",
        (err, results) => {

            if (err) {
                console.log(err);
                return;
            }

            res.render("list", {
                data: results
            });

        }
    );

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});