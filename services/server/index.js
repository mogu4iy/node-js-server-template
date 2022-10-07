const http = require("http");
const app = require("./app")
const config = require("../../config");
const {
    normalizePort,
    onError,
    onListening
} = require("../../utils/server");

const server = http.createServer(app)

const init = async () => {
    const port = normalizePort(config.SERVER.PORT);
    app.set('port', port);
    await server.listen(port)
    server.on('error', (error) => onError(error, port))
    server.on('listening', () => onListening(server))
}

module.exports = {
    server,
    init
}
