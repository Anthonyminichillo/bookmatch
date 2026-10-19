import { getDb } from '../db/connection.js';

const GENRES = [
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Historical Fiction',
  'Horror',
  'Thriller',
  'Biography',
  'Humor',
  'Adventure',
];
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
const SETTINGS = [
  'Small town',
  'Big city',
  'Countryside',
  'Island',
  'Desert',
  'Space',
  'Medieval kingdom',
  'Boarding school',
  'Wartime',
  'Wilderness',
];
const POVS = ['First person', 'Third person', 'Multiple perspectives'];
const PAGES_PER_GENRE = 3;

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getDifficulty(pageCount) {
  if (pageCount < 250) return 'Easy';
  if (pageCount < 450) return 'Medium';
  return 'Hard';
}

function getThemes(subjects = []) {
  return subjects
    .map((s) => s.toLowerCase())
    .filter((s) => s.length < 25 && !/\d|fiction|accessible/.test(s))
    .slice(0, 3);
}

function toBook(doc, genre) {
  const pageCount =
    doc.number_of_pages_median || 150 + Math.floor(Math.random() * 550);
  const difficulty = getDifficulty(pageCount);
  const themes = getThemes(doc.subject);
  const setting = pick(SETTINGS);
  const about = themes.length ? ` exploring ${themes.join(', ')}` : '';
  return {
    title: doc.title,
    author: doc.author_name[0],
    genre,
    pageCount,
    difficulty,
    themes,
    season: pick(SEASONS),
    setting,
    pov: pick(POVS),
    description: `A ${difficulty.toLowerCase()} ${genre.toLowerCase()} read${about}.`,
    seeded: true,
  };
}

async function fetchGenre(genre) {
  const books = [];
  for (let page = 1; page <= PAGES_PER_GENRE; page++) {
    const url =
      'https://openlibrary.org/search.json?' +
      new URLSearchParams({
        q: `subject:${genre}`,
        fields: 'title,author_name,number_of_pages_median,subject',
        limit: '100',
        page: String(page),
      });
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BookMatchClassProject (student project)' },
    });
    if (!res.ok) {
      console.log(`Skipped ${genre} page ${page} (status ${res.status})`);
      continue;
    }
    const data = await res.json();
    for (const doc of data.docs) {
      if (doc.title && doc.author_name?.length) books.push(toBook(doc, genre));
    }
    await sleep(1000);
  }
  console.log(`${genre}: fetched ${books.length}`);
  return books;
}

async function seed() {
  const seen = new Set();
  const all = [];
  for (const genre of GENRES) {
    for (const book of await fetchGenre(genre)) {
      const key = `${book.title}|${book.author}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        all.push(book);
      }
    }
  }

  const db = await getDb();
  await db.collection('books').deleteMany({ seeded: true });
  await db.collection('books').insertMany(all);
  const total = await db.collection('books').countDocuments();
  console.log(`Inserted ${all.length} books. Collection now has ${total}.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
