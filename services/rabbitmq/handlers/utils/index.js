const config = require("../../../config")

const serializeToJsonMiddleware = (data, context, channel, next) => {
    const content = data.content
    context["data"] = JSON.parse(content.toString())
    return next()
}

module.exports = {
    serializeToJsonMiddleware,
}