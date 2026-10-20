const createList = document.querySelector('#create-form')
const statusEl = document.querySelector('#status')
const listsEl = document.querySelector('#lists')
const statusListEl = document.querySelector('#list-status')

createList.addEventListener('submit', async (event) => {
    event.preventDefault()
    const list = Object.fromEntries(new FormData(createList));
    if (!list.name.trim() || !list.description.trim()) {
        statusEl.textContent = 'Please enter a name and a description.';
        return;
    }
    try {
        const res = await fetch('/api/lists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(list),
        });
        if (!res.ok) throw new Error('Create failed');
        createList.reset();
        await loadLists()
        statusEl.textContent = 'List successfully created'
    }
    catch {
        statusEl.textContent = 'Could not create the list. Please try again.'
    }
});

function makeCard(list) {
    const card = document.createElement('article');
    card.className = 'list-card';

    const title = document.createElement('h2');
    const link = document.createElement('a');
    link.href = `list.html?id=${list._id}`;
    link.textContent = list.name;
    title.append(link)

    const description = document.createElement('p');
    description.textContent = list.description;
    
    const total = list.books.length;
    let finished = 0;
    let dnf = 0;
    for (const entry of list.books) {
        if (entry.status == 'Finished') {
            finished += 1
        }
        else if (entry.status == 'Did not finish') {
            dnf += 1
        }
    }
    const progressTotal = total - dnf;
    let progress = '';
    let dnfMeta = '';
    if (progressTotal !== 0) {
        progress = ` | ${Math.round((finished/progressTotal) * 100)}% of list read`;
    }
    if (dnf !== 0) {
        dnfMeta = ` | ${dnf} DNF`
    }

    const meta = document.createElement('p');
    meta.className = 'meta'
    meta.textContent = `${total} Total Books | ${progressTotal - finished} Reading | ${finished} Finished` + dnfMeta + progress;

    const deleteButton = document.createElement('button')
    deleteButton.type = 'button';
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteList(list));

    card.append(title, description, meta, deleteButton);
    return card;
}

async function loadLists() {
    statusListEl.textContent = 'Loading lists...';
    try {
        const res = await fetch('/api/lists');
        if (!res.ok) throw new Error('Error loading lists');
        const lists = await res.json();

        listsEl.replaceChildren(...lists.map(makeCard));
        if (lists.length == 0) {
            statusListEl.textContent = 'You have no reading lists. Try creating one above.';
        }
        else {
            statusListEl.textContent = '';
        }
    }
    catch {
        statusListEl.textContent = 'Error loading lists. Please try again.';
    }
}

async function deleteList(list) {
    if (!window.confirm(`Do you want to delete ${list.name}? This action cannot be undone.`)) {
        return;
    }
    try {
        const res = await fetch(`/api/lists/${list._id}`, { method : 'DELETE'});
        if (!res.ok) throw new Error('Delete failed');
        await loadLists();
        statusListEl.textContent = 'List deleted';
    }
    catch {
        statusListEl.textContent = 'Could not delete list. Please try again.'
    }
}

loadLists()
