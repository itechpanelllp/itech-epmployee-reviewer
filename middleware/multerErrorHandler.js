const multer = require('multer');

const multerErrorHandler = (uploadMiddleware) => {
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(200).json({ error: err.message }); 
            } else if (err) {
                return res.status(200).json({ error: err.message }); 
            }
            next(); 
        });
    };
};

module.exports = multerErrorHandler;
