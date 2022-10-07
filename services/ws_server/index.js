const http = require("http")
const config = require("../../config")
const {WsServer} = require("../../utils/ws_socket")
const {
    exampleController,
} = require("./controllers/example")
const {
    server,
} = require("../server")

const ws_server = new WsServer({
    port: config.SERVER.PORT,
    server: server,
})

ws_server.use(config.LIB.WS_METHOD.WS_METHOD, exampleController)

const init = async () => {
    await ws_server.listen("/websocket");
}

module.exports = {init, ws_server}
