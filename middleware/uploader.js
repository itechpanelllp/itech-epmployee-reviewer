const fs = require('fs');
const multer = require('multer');
const path = require('path');
const now = new Date();

module.exports = {
    upload: function(dir, type = '') {
        if (dir == '') {
            dir = "./public/uploads/";
        }

        const multerStorage = multer.diskStorage({
            destination: function (req, file, callback) {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                callback(null, dir);
            },
            filename: (req, file, callback) => {
                const ext = path.extname(file.originalname);
                const base = path.basename(file.originalname, ext);
                const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
                callback(null, `${base}-${uniqueSuffix}${ext}`);
            },
        });

        const multerFilter = (req, file, cb) => {
            const allowedType = [
                'csv', 'xlsx', 'png', 'jpg', 'jpeg', 'gif', 'webp', 
                'pdf', 'mp4', 'avi', 'mov', 'wmv', 'svg', 'doc', 'docx'
            ];
            const fileType = file.originalname.split('.').pop().toLowerCase();
            if (allowedType.includes(fileType)) {
                cb(null, true);
            } else {
                cb(new Error("File type not allowed, Please try again."), false);
            }
        };

        const upload = multer({
            storage: multerStorage,
            fileFilter: multerFilter,
            limits: { fileSize: 5 * 1024 * 1024 } // 5MB
        });

        return upload;
    },

    handleFormData: function () {
        return multer();
    }
};
