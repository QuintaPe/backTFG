const mongoose = require('mongoose');
const { search, aggsMetrics } = require('../utils/moongose');

const databaseSchema = new mongoose.Schema({
}, { timestamps: true, toJSON: { virtuals: true } });

databaseSchema.statics.search = async function (fields, query = null, size = 0, page = 0, sort = '-createdAt') {
    return await search(this, fields, query, size, page, sort);
}
databaseSchema.statics.aggsMetrics = async function (filters, agg) {
    return await aggsMetrics(this, filters, agg);
}
module.exports = databaseSchema;