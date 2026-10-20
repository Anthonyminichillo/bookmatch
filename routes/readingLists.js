import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../db/connection.js';

const router = Router();

const STATUSES = [
  'Want to read', 
  'Reading', 
  "Did not finish", 
  'Finished', ];

const FIELDS = [
  'name',
  'description',
];

function pickFields(body) {
  const list = {};
  for (const field of FIELDS) {
    if (typeof body[field] === 'string') list[field] = body[field].trim();
  }
  return list;
}

// CREATE (list)
router.post('/', async (req, res) => {
  try {
    const list = pickFields(req.body);
    if (!list.name || !list.description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    list.books = [];
    list.createdAt = new Date();
    list.lastModified = new Date();

    const db = await getDb();
    const result = await db.collection('readingLists').insertOne(list);
    res.status(201).json({ _id: result.insertedId, ...list });
  }
  catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// READ (lists)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const lists = await db
      .collection('readingLists')
      .find()
      .sort({lastModified: -1})
      .toArray();
    res.json(lists);
  }
  catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// READ (one list)
router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid list id' });
    }

    const db = await getDb();
    const list = await db
      .collection('readingLists')
      .findOne({_id: new ObjectId(req.params.id)});
    if(!list) {
      return res.status(404).json({error: "List not found"});
    }
    res.json(list)
  }
  catch(err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE (list)
router.put('/:id', async (req, res) => {
  try {

  }
  catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (list)
router.delete('/:id', async (req, res) => {
  try {

  }
  catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE (add book to list)
router.post('/:id/books', async (req, res) => {
  try {

  }
  catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (book status)
router.put('/:id/books/:bookId', async (req, res) => {
  try {

  }
  catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (remove book from list)
router.delete('/:id/books/:bookId', async (req, res) => {
  try {

  }
  catch(err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
