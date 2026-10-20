const id = new URLSearchParams(window.location.search).get('id');

const status = document.querySelector('#status');
const details = document.querySelector('#list-details');
const editForm = document.querySelector('#edit-form');

const addForm = document.querySelector('#add-form');
const bookListEl = document.querySelector('#book-list');
const booksStatus = document.querySelector('#books-status');
const filterEl = document.querySelector('#status-filter');

const STATUSES = ['Want to read', 'Reading', 'Did not finish', 'Finished'];

let list;
let books = [];

function showDetails() {
  document.querySelector('#list-name').textContent = list.name;
  document.querySelector('#list-description').textContent = list.description;
  editForm.hidden = true;
  details.hidden = false;
}

function showForm() {
  editForm.elements.name.value = list.name;
  editForm.elements.description.value = list.description;
  details.hidden = true;
  editForm.hidden = false;
}
async function loadList() {
  if (!id) {
    status.textContent = 'No list selected.';
    return;
  }
  try {
    const res = await fetch(`/api/lists/${id}`);
    if (!res.ok) throw new Error('Not found');
    list = await res.json();
    status.textContent = '';
    showDetails();
    await loadBooks();
  } 
  catch {
    status.textContent = 'List not found.';
  }
}

async function fetchBook(bookId) {
  const res = await fetch(`/api/books/${bookId}`);
  if (!res.ok) return null;
  return res.json();
}

function makeBookCard({ entry, book }) {
  const row = document.createElement('article');
  row.className = 'book-row';
  const title = document.createElement('h3');
  const author = document.createElement('p');
  author.className = 'author';
  if (book) {
    const link = document.createElement('a');
    link.href = `book.html?id=${book._id}`;
    link.textContent = book.title;
    title.append(link);
    author.textContent = `by ${book.author}`;
  } 
  else {
    title.textContent = 'Book no longer available';
    author.textContent = 'This book was removed from the catalog.';
  }

  const label = document.createElement('label');
  label.textContent = 'Status ';
  const select = document.createElement('select');
  for (const status of STATUSES) {
    const option = document.createElement('option');
    option.textContent = status;
    select.append(option);
  }
  select.value = entry.status;
  select.addEventListener('change', () => updateStatus(entry, select.value));
  label.append(select);

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.textContent = 'Remove';
  removeButton.addEventListener('click', () => removeBook(entry, book));
  row.append(title, author, label, removeButton);
  return row;
}

function makeBooks() {
  const filter = filterEl.value;
  let shown = books;
  if (filter) {
    shown = books.filter(({ entry }) => entry.status == filter);
  }
  bookListEl.replaceChildren(...shown.map(makeBookCard));
  if (books.length === 0) {
    booksStatus.textContent = 'No books yet. Add one above';
  } 
  else if (shown.length === 0) {
    booksStatus.textContent = `No books marked "${filter}".`;
  } 
  else {
    booksStatus.textContent = '';
  }
}

async function loadBooks() {
  booksStatus.textContent = 'Loading books...';
  try {
    const details = await Promise.all(
      list.books.map((entry) => fetchBook(entry.bookId)),
    );
    books = list.books.map((entry, i) => ({ entry, book: details[i] }));
    makeBooks();
  } catch {
    booksStatus.textContent = 'Could not load the books.';
  }
}

async function updateStatus(entry, newStatus) {
  try {
    const res = await fetch(`/api/lists/${id}/books/${entry.bookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) throw new Error('Update failed');
    entry.status = newStatus;
    makeBooks();
    booksStatus.textContent = 'Reading status updated.';
  } 
  catch {
    makeBooks();
    booksStatus.textContent = 'Could not update the reading status. Please try again.';
  }
}


async function removeBook(entry, book) {
  const name = book ? `"${book.title}"` : 'this book';
  if (!window.confirm(`Do you want to remove ${name} from this list?`)) {
    return;
  }
  try {
    const res = await fetch(`/api/lists/${id}/books/${entry.bookId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Remove failed');
    books = books.filter((item) => item.entry !== entry);
    makeBooks();
    booksStatus.textContent = `Removed ${name}.`;
  } catch {
    booksStatus.textContent = 'Could not remove the book. Please try again.';
  }
}

addForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = addForm.elements.title.value.trim();
  if (!title) {
    booksStatus.textContent = 'Please enter a book title.';
    return;
  }
  try {
    const searchRes = await fetch(
      `/api/books?q=${encodeURIComponent(title)}&limit=200`,
    );
    if (!searchRes.ok) throw new Error('Search failed');
    const matches = await searchRes.json();
    const book = matches.find(
      (b) => b.title.toLowerCase() === title.toLowerCase(),
    );
    if (!book) {
      booksStatus.textContent =
        'No book found with that title. Check the spelling and try again.';
      return;
    }

    const res = await fetch(`/api/lists/${id}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: book._id }),
    });
    if (res.status === 409) {
      booksStatus.textContent = `"${book.title}" is already in this list.`;
      return;
    }
    if (!res.ok) throw new Error('Add failed');

    addForm.reset();
    await loadList();
    booksStatus.textContent = `Added "${book.title}".`;
  } 
  catch {
    booksStatus.textContent = 'Could not add the book. Please try again.';
  }
});

editForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const updates = Object.fromEntries(new FormData(editForm));
  if (!updates.name.trim() || !updates.description.trim()) {
    status.textContent = 'Please enter a name and description.';
    return;
  }
  try {
    const res = await fetch(`/api/lists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Update failed');
    await loadList();
    status.textContent = 'List updated.';
  } 
  catch {
    status.textContent = 'Could not update the name and description. Please try again.';
  }
});

document.querySelector('#edit-button').addEventListener('click', showForm);
document.querySelector('#cancel-button').addEventListener('click', showDetails);
filterEl.addEventListener('change', makeBooks);

loadList();
