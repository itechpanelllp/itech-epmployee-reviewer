require('dotenv').config();
require('module-alias/register');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 10000, limit: '10mb' }));
const port = process.env.PORT || 1000;
app.use(express.static("public"));
app.use(express.static("views"));
app.use('/locales', express.static('locales'));
const i18n = require('./i18n');


app.use(i18n.init);
app.use(cookieParser());
app.use(flash());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
}));

app.use((req, res, next) => {
    const lang = req.cookies.lang;
    if (lang && i18n.getLocales().includes(lang)) {
        i18n.setLocale(req, lang);
    } else {
        i18n.setLocale(req, process.env.DEFAULT_LANG);
    }
    next();
});



app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// routers
app.use(require('./middleware/headerMiddleware'));
app.use(require('./middleware/languageFile'));
app.use(require('./router/router'));

// base url
app.locals.base_url = process.env.BASE_URL;

// Middleware to pass flash messages to all views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

