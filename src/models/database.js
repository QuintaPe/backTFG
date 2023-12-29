import mongoose from 'mongoose';

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
  populate = '',
  lean = false,
) {
  function transformSortNotation(inputNotation) {
    if (!inputNotation || typeof inputNotation !== 'string') return {};    
    const sortObject = {};
    const parts = inputNotation.split(',');

    parts.forEach(part => {
      const trimmedPart = part.trim();
      const fieldName = trimmedPart.slice(1);
      if (trimmedPart.startsWith('-')) {
        sortObject[fieldName] = -1;
      } else {
        sortObject[fieldName] = 1;
      }
    });
    
    return sortObject;
  }

  const options = {
    limit: +size === 0 ? 10000 : +size,
    skip: +size === 0 ? 0 : +size * +page,
    sort: transformSortNotation(sort),
    populate,
  };

  let fieldsObj = {};
  if (fields) {
    fieldsObj = fields.reduce((obj, field) => ({ ...obj, [field]: 1 }), {});
  }

  let results = this.find(query, fieldsObj, options);
  
  if (lean) {
    results = results.lean();
  }
  
  results = await results.exec();

  const total = await this.countDocuments(query);
  if (fields?.length === 1) {
    results = results.map((item) => item[fields[0]]);
  }

  return { items: results, total: total };
};

export default databaseSchema;
