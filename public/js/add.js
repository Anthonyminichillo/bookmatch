const form = document.querySelector('#add-form');
const statusEl = document.querySelector('#status');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const book = Object.fromEntries(new FormData(form));
  try {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    if (!res.ok) throw new Error('Create failed');
    const created = await res.json();
    window.location.href = `book.html?id=${created._id}`;
  } catch {
    statusEl.textContent = 'Could not add the book. Please try again.';
  }
});
