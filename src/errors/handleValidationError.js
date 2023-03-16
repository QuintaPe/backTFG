module.exports = function handleValidationError(err, req, res, next) {
  const errors = Object.values(err.errors).map(val => {
    return { path: val.path, message: val.message }
  });
  
  return res.status(422).json({
    success: false,
    errors, 
  });
}