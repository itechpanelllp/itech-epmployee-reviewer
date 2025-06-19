const i18n = require('i18n');
i18n.configure({
    locales: ['en', 'fr'],
    directory: __dirname + '/locales',
    defaultLocale: (req) => req.cookies.lang || process.env.DEFAULT_LANG,
    cookie: 'lang',
    locale: (req) => req.cookies.lang || process.env.DEFAULT_LANG,
    objectNotation: true,
    register: global,
    extension: '.json',
    format: 'json'
});

module.exports = i18n;
