const httpRequest = ({url, method = "GET", params = null, body = {}, headers = {}}) => {
    let requestUrl = new URL(url)
    if (params) {
        Object.keys(params).forEach(key => requestUrl.searchParams.append(key, params[key]))
    }

    return [requestUrl, {
        method: method,
        headers: headers,
        body: body
    }]
}

function pickRandomProperty(obj) {
    let result
    let count = 0
    for (let prop in obj)
        if (Math.random() < 1 / ++count) {
            result = prop
        }
    return result
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value)
}

function lowerCase(string) {
    return string.toLowerCase()
}

const hashCode = (string) => {
    let hash = 0, i, chr
    if (string.length === 0) return hash
    for (i = 0; i < string.length; i++) {
        chr = string.charCodeAt(i)
        hash = ((hash << 5) - hash) + chr
        hash |= 0
    }
    return hash
}

function randomCode(length) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function randomPassword() {
    return randomCode(16);
}

const axiosRequest = async ({
                                method = 'GET',
                                url,
                                params = {},
                                query,
                                options,
                                body,
                            }) => {
    const request = {
        method: method,
        url: url,
        ...options,
    };
    switch (method) {
        case 'GET':
            request.params = params;
            break;
        default:
            request.data = body;
    }
    if (typeof query === 'object' && query !== null && Object.entries(query).length > 0){
        request.url = `${request.url}?${Object.entries(query).map(([key, value]) => `${key}=${value}`).join("&")}`
    }
    return request;
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = {
    pickRandomProperty,
    getKeyByValue,
    hashCode,
    lowerCase,
    httpRequest,
    randomCode,
    randomPassword,
    axiosRequest,
    sleep
}
