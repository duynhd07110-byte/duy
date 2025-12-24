const jsonServer = require('json-server');
const cors = require('cors');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(cors());
server.use(middlewares);
server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log('JSON Server is running on port ' + port);
});
