const {wsHandlerWrapper} = require("../../../../utils/errors");

const exampleData = (data, context, ws, ws_server) => {
    return {}
}
const examplePromise = (data, context, ws, ws_server, next) => {

}

module.exports = {
    exampleController: wsHandlerWrapper({
        dataFunction: exampleData,
        promiseHandler: examplePromise
    })
}