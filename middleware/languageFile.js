
const {languageFile} = require('@middleware/commonMiddleware');

const getCurrentLanguage = (req, res, next) => {
  try {
    const lang =  req.cookies.lang || req.session.userLang || process.env.DEFAULT_LANG;
    res.locals.lngData = languageFile(lang);
    next()
  } catch (error) {
    res.locals.lngData = languageFile(process.env.DEFAULT_LANG);
  }
 
}

module.exports = getCurrentLanguage;