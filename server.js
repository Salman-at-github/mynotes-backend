const app = require('./app');
const port = process.env.PORT || 3030;

const server = app.listen(port, () => {
  console.log(`Backend app started on ${port}`);
});

module.exports = server;
