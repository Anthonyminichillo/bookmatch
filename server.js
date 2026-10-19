import 'dotenv/config';
import express from 'express';
import booksRouter from './routes/books.js';
import listsRouter from './routes/readingLists.js';

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.use('/api/books', booksRouter);
app.use('/api/lists', listsRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`BookMatch running on http://localhost:${port}`);
});
