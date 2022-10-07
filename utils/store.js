const store = require('store')

class Store {
    #initFunc = () => {
    }
    #updateFunc = () => {
    }

    constructor({key, init, update}) {
        this.key = key
        this.#initFunc = init
        this.#updateFunc = update
    }

    async init(...data) {
        return await this.#initFunc(this, ...data)
    }

    async update(...data) {
        return await this.#updateFunc(this, ...data)
    }

    set(key, data) {
        store.set(this.configureStoreKey(key), data)
    }

    get(key) {
        return store.get(this.configureStoreKey(key))
    }

    remove(key) {
        store.remove(this.configureStoreKey(key))
    }

    getByKeys(data){
        const recordIdList = []
        const recordList = []
        store.each((value, key) => {
            if (this.checkStoreKey(key)) {
                if (recordIdList.includes(value["id"])) {
                    return
                }
                recordIdList.push(value["id"])
                let equal = true
                for (let dataKey in data) {
                    if (data[dataKey] !== value[dataKey]) {
                        equal = false
                        break
                    }
                }
                if (equal) {
                    recordList.push(value)
                }
            }
        })
        return recordList
    }

    getAllStore() {
        const recordIdList = []
        const recordList = []
        store.each((value, key) => {
            if (this.checkStoreKey(key)) {
                if (recordIdList.includes(value["id"])) {
                    return
                }
                recordIdList.push(value["id"])
                recordList.push(value)
            }
        })
        return recordList
    }

    checkStoreKey(key) {
        const [store, storeKey] = key.split("_:_")
        return store === this.key
    }

    configureStoreKey(key) {
        return `${this.key}_:_${key}`
    }
}

module.exports = {
    Store
}