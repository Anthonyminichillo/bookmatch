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
  }
  catch(err) {
  }
});

// READ (lists)
router.get('/', async (req, res) => {
  try {

  }
  catch(err) {
    
  }
});

// READ (one list)
router.get('/:id', async (req, res) => {
  try {

  }
  catch(err) {
    
  }
});


// UPDATE (list)
router.put('/:id', async (req, res) => {
  try {

  }
  catch(err) {
    
  }
});

// DELETE (list)
router.delete('/:id', async (req, res) => {
  try {

  }
  catch(err) {
    
  }
});

// CREATE (add book to list)
router.post('/:id/books', async (req, res) => {
  try {

  }
  catch(err) {
    
  }
});

// UPDATE (book status)
router.put('/:id/books/:bookId', async (req, res) => {
  try {

  }
  catch(err) {
    
  }
});

// DELETE (remove book from list)
router.delete('/:id/books/:bookId', async (req, res) => {
  try {

  }
  catch(err) {
    
  }
});

export default router;
