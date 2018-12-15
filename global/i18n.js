const i18n = require('i18n');
const path = require('path');
const config = require('../website/config');

// Configure internationalisation
i18n.configure({
  directory: path.join(__dirname, '..', 'locales'),
  cookie: 'lang',
  defaultLocale: config.default.language,
  autoReload: true,
  updateFiles: false,
  objectNotation: true
});

module.exports = i18n;
