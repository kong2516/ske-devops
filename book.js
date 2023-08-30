import path from "path";
import fs from "fs/promises";
import express from "express";
import promClient from "prom-client"

const BOOK_DIR = path.resolve("books");

const bookReadMetrics = new promClient.Counter({
  name: "books_read",
  help: "Number of books read",
  labelNames: ["name"]
})

export default function register(app) {
  const subrouter = express.Router();
  app.use("/bookService", subrouter);
  subrouter.get("/list", async (req, res) => {
    const files = await fs.readdir(BOOK_DIR);
    res.json({ books: files });
    res.end();
  });

  subrouter.get("/get/:name", async (req, res) => {
    const bookPath = path.resolve(BOOK_DIR, req.params.name);
    if (!bookPath.startsWith(BOOK_DIR)) {
      res.statusCode = 400;
      res.end();
    }
    bookReadMetrics.labels({"name": req.params.name}).inc(1)
    res.sendFile(bookPath);
  });
}
