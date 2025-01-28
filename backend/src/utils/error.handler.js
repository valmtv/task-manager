const handleError = (res, err) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
};

module.exports = handleError;
