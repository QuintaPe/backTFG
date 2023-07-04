const mongoose = require('mongoose');

const databaseSchema = new mongoose.Schema(
  {},
  { timestamps: true, toJSON: { virtuals: true } }
);

databaseSchema.statics.search = async function (
  fields = null,
  query = null,
  size = 0,
  page = 0,
  sort = '',
  populate = ''
) {
  const options = {
    limit: +size === 0 ? 10000 : +size,
    skip: +size === 0 ? 0 : +size * +page,
    sort,
    populate,
  };

  let fieldsObj = {};
  if (fields) {
    fieldsObj = fields.reduce((obj, field) => ({ ...obj, [field]: 1 }), {});
  }

  let results = await this.find(query, fieldsObj, options);
  const total = await this.countDocuments(query);
  if (fields?.length === 1) {
    results = results.map((item) => item[fields[0]]);
  }

  return { items: results, total: total };
};

module.exports = databaseSchema;
