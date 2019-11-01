require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

const store = require('./movies-data-small');
const API_TOKEN = process.env.API_TOKEN;
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganSetting));
app.use(cors());
app.use(helmet());
app.use(validateBearer);

function validateBearer(req, res, next) {
  const authVal = req.get('Authorization') || '';
  if (!authVal.startsWith('Bearer ')) {
    return res.status(400).json({ error: 'Authorization token not found' });
  }
  const token = authVal.split(' ')[1];
  if (token !== API_TOKEN) {
    return res.status(401).json({ error: 'Token is invalid' });
  }
  next();
}

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

app.get('/movie', (req, res) => {
  let movies = store;
  const { genre, country, avg_vote } = req.query;

  if (genre) {
    movies = movies.filter((app) =>
      app.genre.toLowerCase().includes(genre.toLowerCase()),
    );
  }

  if (country) {
    movies = movies.filter((app) =>
      app.country.toLowerCase().includes(country.toLowerCase()),
    );
  }

  if (avg_vote) {
    movies = movies.filter((app) => Number(app.avg_vote) >= Number(avg_vote));
  }

  res.json(movies);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {});