const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`Portfolio backend escuchando en http://localhost:${config.port}`);
});
