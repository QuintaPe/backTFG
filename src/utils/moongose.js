async function search(model, fields = null, query = {}, size = 10, page = 0, sort = '-createdAt') {
    size = parseInt(size);
    const options = {
      limit: size === 0 ? 10000 : size,
      skip: size === 0 ? 0 : size * page,
      sort: sort,
    };
  
    let fieldsObj = {};
    if (fields) {
      fieldsObj = fields.reduce((obj, field) => ({ ...obj, [field]: 1 }), {});
    }
  
    const results = await model.find(query, fieldsObj, options);     
    const total = await model.countDocuments(query);
  
    return { items: results, total: total};
};

async function aggsMetrics(model, query = {}, aggs = {}) {
    try {
      const results = await model.aggregate([
        { $match: query },
        { $group: aggs },
      ]);
      return results && results.length > 0 ? results[0] : {};
    } catch (err) {
      console.error(err);
      return {};
    }
};

module.exports = {
    search,
    aggsMetrics,
}