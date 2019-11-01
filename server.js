require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());


app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization') || '';

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' })
  };
  next();
});

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
});

app.get('/movie', (req, res) => {
  let movies = store;
  const {genre, country, avg_vote} = req.query;

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
