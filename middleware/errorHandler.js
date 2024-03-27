const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    // Check for specific error types and handle accordingly
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    // Handle other errors
    return res.status(500).json({ message: 'Internal Server Error' });
  };
  
  module.exports = errorHandler; 
  