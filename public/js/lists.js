const createList = document.querySelector("#create-form")
const statusEl = document.querySelector("#status")
const listEl = document.querySelector("#lists")

createList.addEventListener("submit", async (event) => {
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

async function loadLists() {

}