const mongoose = require('mongoose');
const { search } = require('../utils/moongose');

const databaseSchema = new mongoose.Schema({}, { timestamps: true, toJSON: { virtuals: true } });

databaseSchema.statics.search = async function (fields, query = null, size = 0, page = 0, sort = '', populate = '') {
    return await search(this, fields, query, size, page, sort, populate);
}

module.exports = databaseSchema;