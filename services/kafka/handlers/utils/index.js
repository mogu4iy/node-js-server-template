const serializeToJsonMiddleware = (data, context, kafka, next) => {
    const content = data.value
    context["data"] = JSON.parse(content.toString())
    return next()
}

module.exports = {
    serializeToJsonMiddleware,
}