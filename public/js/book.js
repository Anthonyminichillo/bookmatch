const id = new URLSearchParams(window.location.search).get('id');
const statusEl = document.querySelector('#status');
const details = document.querySelector('#details');
const form = document.querySelector('#edit-form');
const factsEl = document.querySelector('#book-facts');

let book;

function showDetails() {
  document.querySelector('#book-title').textContent = book.title;
  document.querySelector('#book-author').textContent = `by ${book.author}`;
  document.querySelector('#book-description').textContent =
    book.description || 'No description yet.';

  const facts = [
    ['Genre', book.genre],
    ['Pages', book.pageCount],
    ['Difficulty', book.difficulty],
    ['Season', book.season],
    ['Setting', book.setting],
    ['Point of view', book.pov],
    ['Themes', (book.themes || []).join(', ')],
  ];
  const rows = facts.flatMap(([label, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value || 'N/A';
    return [dt, dd];
  });
  factsEl.replaceChildren(...rows);

  form.hidden = true;
  details.hidden = false;
}

function showForm() {
  for (const field of [
    'title',
    'author',
    'genre',
    'pageCount',
    'difficulty',
    'season',
    'pov',
    'setting',
    'description',
  ]) {
    form.elements[field].value = book[field] ?? '';
  }
  form.elements.themes.value = (book.themes || []).join(', ');
  details.hidden = true;
  form.hidden = false;
}

async function loadBook() {
  if (!id) {
    statusEl.textContent = 'No book selected.';
    return;
  }
  try {
    const res = await fetch(`/api/books/${id}`);
    if (!res.ok) throw new Error('Not found');
    book = await res.json();
    statusEl.textContent = '';
    showDetails();
  } catch {
    statusEl.textContent = 'Could not find that book.';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const updates = Object.fromEntries(new FormData(form));
  try {
    const res = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Update failed');
    await loadBook();
  } catch {
    statusEl.textContent = 'Could not save changes. Please try again.';
  }
});

document.querySelector('#edit-button').addEventListener('click', showForm);
document.querySelector('#cancel-button').addEventListener('click', showDetails);

document.querySelector('#delete-button').addEventListener('click', async () => {
  if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) {
    return;
  }
  try {
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    window.location.href = 'index.html';
  } catch {
    statusEl.textContent = 'Could not delete the book. Please try again.';
  }
});

loadBook();
