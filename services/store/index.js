const {store: i18nKey} = require("./i18nKey")
const {store: i18nTranslation} = require("./i18nTranslation")
const {store: i18nLanguage} = require("./i18nLanguage")

const store = {
    [i18nKey.key]: i18nKey,
    [i18nTranslation.key]: i18nTranslation,
    [i18nLanguage.key]: i18nLanguage,
}

const init = async () => {
    for (let storeItem in store){
        await store[storeItem].init()
    }
}

module.exports = {
    init,
    store
}