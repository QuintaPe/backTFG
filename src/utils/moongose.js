async function search(model, fields = null, query = {}, size = 10, page = 0, sort = '-createdAt', populate = '') {
    size = parseInt(size);

    const options = {
      limit: size === 0 ? 10000 : size,
      skip: size === 0 ? 0 : size * page,
      sort,
      populate,
    };
  
    let fieldsObj = {};
    if (fields) {
      fieldsObj = fields.reduce((obj, field) => ({ ...obj, [field]: 1 }), {});
    }
  
    let results = await model.find(query, fieldsObj, options);
    const total = await model.countDocuments(query);
    if (fields?.length === 1) {
      results = results.map(item => item[fields[0]]);
    }
  
    return { items: results, total: total};
};

module.exports = {
    search,
}