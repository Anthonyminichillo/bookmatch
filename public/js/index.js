const PAGE_SIZE = 12;
const form = document.querySelector('#filter-form');
const resultsEl = document.querySelector('#results');
const statusEl = document.querySelector('#status');
const prevButton = document.querySelector('#prev-button');
const nextButton = document.querySelector('#next-button');
const pageLabel = document.querySelector('#page-label');

let page = 1;

function buildQuery() {
  const params = new URLSearchParams();
  for (const [key, value] of new FormData(form)) {
    if (value.trim() !== '') params.set(key, value.trim());
  }
  params.set('limit', PAGE_SIZE);
  params.set('page', page);
  return params.toString();
}

function makeCard(book) {
  const card = document.createElement('article');
  card.className = 'book-card';

  const title = document.createElement('h2');
  const link = document.createElement('a');
  link.href = `book.html?id=${book._id}`;
  link.textContent = book.title;
  title.append(link);

  const author = document.createElement('p');
  author.className = 'author';
  author.textContent = `by ${book.author}`;

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = [
    book.genre,
    `${book.pageCount} pages`,
    book.difficulty,
    book.season,
  ].join(' · ');

  card.append(title, author, meta);
  return card;
}

async function loadBooks() {
  statusEl.textContent = 'Loading...';
  try {
    const res = await fetch(`/api/books?${buildQuery()}`);
    if (!res.ok) throw new Error('Server error');
    const books = await res.json();

    resultsEl.replaceChildren(...books.map(makeCard));
    statusEl.textContent = books.length ? '' : 'No books match those filters.';
    pageLabel.textContent = `Page ${page}`;
    prevButton.disabled = page === 1;
    nextButton.disabled = books.length < PAGE_SIZE;
  } catch {
    statusEl.textContent = 'Could not load books. Please try again.';
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  page = 1;
  loadBooks();
});

form.addEventListener('reset', () => {
  page = 1;
  setTimeout(loadBooks, 0);
});

prevButton.addEventListener('click', () => {
  page -= 1;
  loadBooks();
});

nextButton.addEventListener('click', () => {
  page += 1;
  loadBooks();
});

loadBooks();
