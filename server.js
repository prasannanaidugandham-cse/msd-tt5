const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());

const FILE_PATH = './books.json';

// Utility function to read books
function readBooks() {
  try {
    if (!fs.existsSync(FILE_PATH)) return [];
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Utility function to write books
function writeBooks(books) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(books, null, 2));
}

// GET /books → return all books
app.get('/books', (req, res) => {
  const books = readBooks();
  res.json(books);
});

// GET /books/available → return available books
app.get('/books/available', (req, res) => {
  const books = readBooks();
  const availableBooks = books.filter(book => book.available === true);
  res.json(availableBooks);
});

// POST /books → add new book
app.post('/books', (req, res) => {
  const { title, author, available } = req.body;
  if (!title || !author || available === undefined) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const books = readBooks();
  const newId = books.length > 0 ? books[books.length - 1].id + 1 : 1;
  const newBook = { id: newId, title, author, available };
  books.push(newBook);
  writeBooks(books);

  res.status(201).json(newBook);
});

// PUT /books/:id → update book
app.put('/books/:id', (req, res) => {
  const { id } = req.params;
  const { title, author, available } = req.body;
  const books = readBooks();
  const index = books.findIndex(book => book.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  if (title !== undefined) books[index].title = title;
  if (author !== undefined) books[index].author = author;
  if (available !== undefined) books[index].available = available;

  writeBooks(books);
  res.json(books[index]);
});

// DELETE /books/:id → delete book
app.delete('/books/:id', (req, res) => {
  const { id } = req.params;
  const books = readBooks();
  const newBooks = books.filter(book => book.id !== parseInt(id));

  if (newBooks.length === books.length) {
    return res.status(404).json({ error: 'Book not found' });
  }

  writeBooks(newBooks);
  res.json({ message: 'Book deleted successfully' });
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
