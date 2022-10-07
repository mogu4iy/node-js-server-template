function validateObject(object) {
    if (!object) {
        return false
    }
    if (typeof object === 'undefined') {
        return false
    }
    for (let key in object) {
        if (object.hasOwnProperty(key)) {
            if (!validateField(object[key])) {
                return false
            }
        }
    }
    return true
}

function validateField(field) {
    if ([undefined, NaN].includes(field)) {
        return false
    }
    if (typeof field === 'object') {
        if (!validateObject(field)) {
            return false
        }
    }
    return true
}

const validateConfig = config => {
    return validateObject(config)
}

const clearObject = object => {
    for (let key in object) {
        if (object.hasOwnProperty(key)) {
            if ([undefined, null, NaN].includes(object[key])) {
                delete object[key]
            }
            if (typeof object[key] === 'object') {
                clearObject(object[key])
            }
        }
    }
}

module.exports = {
    validateConfig,
    validateObject,
    clearObject
}