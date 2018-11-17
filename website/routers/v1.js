const express = require('express');
const r = require('../rethinkdb');

const router = express.Router();

router
  .get('/bots', (req, res, next) => {
    r.table('bots')
      .without('token')
      .then((bots) => {
        res.json(bots);
      })
      .catch((err) => {
        next(err);
      });
  })
  .get('/bots/:id', (req, res, next) => {
    r.table('bots')
      .get(req.params.id)
      .without('token')
      .then((bots) => {
        res.json(bots);
      })
      .catch((err) => {
        next(err);
      });
  })
  .use((err, req, res, next) => { // eslint-disable-line
    if (err) {
      res.status(500).json({
        ok: false,
        err: err.message
      });
    } else {
      res.status(500).json({
        ok: false,
        err: 'Internal server error'
      });
    }
  });

module.exports = router;