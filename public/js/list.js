const id = new URLSearchParams(window.location.search).get('id');

const status = document.querySelector('#status');
const details = document.querySelector('#list-details');
const editForm = document.querySelector('#edit-form');

let list;

function showDetails() {
    document.querySelector('#list-name').textContent = list.name;
    document.querySelector('#list-description').textContent = list.description;
    editForm.hidden = true;
    details.hidden = false;
}

function showForm() {
    editForm.elements.name.value = list.name;
    editForm.elements.description.value = list.description;
    details.hidden = true;editForm.hidden = false;
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
    } 
    catch {
        status.textContent = 'List not found.';
    }
}

editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const updates = Object.fromEntries(new FormData(editForm));
    if (!updates.name.trim() || !updates.description.trim()) {
        statusEl.textContent = 'Please enter a name and a description.';
        return;
    }
    try {
        const res = await fetch(`/api/lists/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),});
        if (!res.ok) throw new Error('Update failed');
        await loadList();
        statusEl.textContent = 'List updated.';
    } 
    catch {
        statusEl.textContent = 'Could not save changes. Please try again.';
    }
});

document.querySelector('#edit-button').addEventListener('click', showForm);
document.querySelector('#cancel-button').addEventListener('click', showDetails);

loadList();