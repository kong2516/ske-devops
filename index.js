import express from "express";
import axios from "axios";
import promClient from "prom-client"
import promBundle from "express-prom-bundle";
import registerBookService from "./book.js";

const bookService = new axios.Axios({
  baseURL: "http://localhost:3030/bookService/",
});

promClient.collectDefaultMetrics()

const app = express();

app.use(promBundle({
  includePath: true,
  includeMethod: true,
}));

app.get("/", async (req, res) => {
  const bookResp = await bookService.get("list");
  const books = JSON.parse(bookResp.data);
  res.write(`
    <h1>Library</h1>
    Available books:
    <ul>
      ${books.books
        .map((book) => `<li><a href="/read/${book}">${book}</a></li>`)
        .join("\n")}
    </ul>
  `);
  res.end();
});
app.get("/read/:book", async (req, res) => {
  const content = await bookService.get(`/get/${req.params.book}`);
  res.write(content.data);
  res.end();
});
registerBookService(app);
app.listen(3030);
console.log(`Listening on http://localhost:3030`);
