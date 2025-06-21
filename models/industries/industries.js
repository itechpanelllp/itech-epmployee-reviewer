const express = require('express');
const app = express.Router();
const IndustryTables = require('@config/databasetable');
const db = require('@config/db');


module.exports = {
    // industry datatable
    industryDataTable: async (where, start, limit, sort, order) => {
        const query = `SELECT ci.id AS industryId, cim.*, COUNT(ci.id) OVER() AS total,(SELECT COUNT(*) FROM ${IndustryTables.tbl_catalog_categories}  WHERE catalog_industry_id = ci.id ) AS category_count FROM ${IndustryTables.tbl_catalog_industries} AS ci LEFT JOIN ${IndustryTables.tbl_catalog_industry_metas} AS cim ON cim.catalog_industry_id = ci.id WHERE ${where}  ORDER BY ${sort} ${order} LIMIT ${start}, ${limit} `
        const value = [];
        const result = await db.query(query, value);
        return result || '';
    },

    // update industry status
    updateIndustryStatus: async (id, status) => {
        const result = await db.query(`UPDATE ${IndustryTables.tbl_catalog_industries} set status = ${status} WHERE id = '${id}'`);
        return result || '';
    },

    // check industry
    checkIndustry: async (name) => {
        const result = await db.query(`SELECT * FROM ${IndustryTables.tbl_catalog_industry_metas} WHERE name = '${name}'`);
        return result[0] || '';
    },

    // add industry
    addIndustry: async (data) => {
        const result = await db.query(`INSERT INTO ${IndustryTables.tbl_catalog_industries} (slug) VALUES(?)`, [data]);
        return Number(result.insertId) || '';
    },

    addIndustryMeta: async (data) => {
        const result = await db.query(`INSERT INTO ${IndustryTables.tbl_catalog_industry_metas} (catalog_industry_id, name, status) VALUES(?, ?, ?)`, [data.catalog_industry_id, data.name, data.status]);
        return result || '';
    },

    // get industry data
    getIndustryData: async (id) => {
        const result = await db.query(`SELECT cim.*, ci.slug FROM ${IndustryTables.tbl_catalog_industries} AS ci LEFT JOIN ${IndustryTables.tbl_catalog_industry_metas} AS cim ON cim.catalog_industry_id = ci.id WHERE ci.id = '${id}'`);
        return result[0] || '';
    },
    // update industry data
    updateIndustry: async (slug, name, status, id) => {
        const result = await db.query(`START TRANSACTION; UPDATE ${IndustryTables.tbl_catalog_industries} SET slug = ? WHERE id = ?; UPDATE ${IndustryTables.tbl_catalog_industry_metas} SET name = ?, status = ?  WHERE id = ?; COMMIT;`, [slug, id, name, status, id]);
        return result || '';
    },
    // bulk action status
    bulkActionStatus: async (id, val) => {
        const result = await db.query(`UPDATE ${IndustryTables.tbl_catalog_industry_metas} SET status = ? WHERE id IN (?)`, [val, id]);
        return result || '';
    },
    // bulk action delete
    bulkActionDelete: async (id) => {
        const result = await db.query(`DELETE FROM ${IndustryTables.tbl_catalog_industries} WHERE id IN (?)`, [id]);
        return result || '';
    },

    //check industry in product
    checkIndustryUseInProduct: async (ids) => {
        const placeholders = ids.map(() => '?').join(', ');
        const query = `SELECT * FROM ${IndustryTables.tbl_catalog_products} WHERE industry_id IN (${placeholders})`;
        const result = await db.query(query, ids);
        return result || [];
    },



}