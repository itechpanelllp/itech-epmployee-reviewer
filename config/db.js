const mariadb = require('mariadb');

const db = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 20,  
    acquireTimeout: 20000,  
    multipleStatements: true,
    typeCast: (field, next) => {
        if (field.type === 'BIGINT') {
            return field.string(); 
        }
        return next();
    }
});

module.exports = db;
