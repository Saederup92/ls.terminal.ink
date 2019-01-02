const express = require('express');
const r = require('../rethinkdb');
const config = require('../config');

const authRouter = require('./auth');
const botsRouter = require('./bots');
const langRouter = require('./locales');
const adminRouter = require('./admin');
const docsRouter = require('./docs');
const v1Router = require('./v1');
const v2Router = require('./v2');

const { localise } = require('../static/list');
const manifest = require('../static/manifest');

const categories = require('../data/categories.json');

const router = express.Router();

router
  .use((req, res, next) => {
    if (req.user) {
      req.user.admin = req.user && config.owners.includes(req.user.id);
      res.locals.user = req.user;
    } else {
      res.locals.user = {};
    }
    res.locals.url = req.url;
    res.locals.languagePrefix = res.getLocale() === config.default.language ? '' : `/${res.getLocale()}`;
    next();
  })
  .get('/', (req, res, next) => {
    r.table('bots')
      .merge(bot => r.branch(bot('contents').hasFields(res.getLocale()), {
        random: bot('random').add(10)
      }, {}))
      .orderBy(r.desc('random'))
      .filter({
        state: 'approved',
        nsfw: false,
        hide: false
      })
      .limit(18)
      .then((list) => {
        const localised = list.map(item => localise(item, res));
        const slider = localised.splice(0, 6);
        res.render('main', {
          slider,
          cards: localised,
          categories
        });
      })
      .catch((err) => {
        next(err);
      });
  })
  .get('/oops', (req, res, next) => {
    next(new Error('This error was thrown on purpose'));
  })
  .use('/auth', authRouter)
  .use('/bots', botsRouter)
  .use('/locale', langRouter)
  .use('/admin', adminRouter)
  .use('/docs', docsRouter)
  .use('/edit', (req, res) => {
    res.redirect(`${res.locals.languagePrefix}/bots/add`);
  })
  .use('/bot/:id', (req, res) => {
    res.redirect(`${res.locals.languagePrefix}/bots/${req.params.id}`);
  })
  .use('/api/v1', v1Router)
  .use('/api/v2', v2Router)
  .use('/api', v1Router)
  .use('/manifest.json', (req, res) => {
    res.json(manifest(res));
  });

module.exports = router;
