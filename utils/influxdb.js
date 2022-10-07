const {InfluxDB, Point} = require("@influxdata/influxdb-client")
const {
    SetupAPI,
    AuthorizationsAPI,
    SigninAPI,
    OrgsAPI,
    SignoutAPI,
    PingAPI
} = require('@influxdata/influxdb-client-apis')
const moment = require("moment");
const config = require("../config");

class InfluxdbClient {
    #baseUrl = null
    #password = null
    #username = null
    #timeout = 10 * 1000
    #setupApi = null
    #authApi = null
    #signInApi = null
    #orgsApi = null
    #signOutApi = null
    #pingApi = null
    #baseClient = null
    #transportOptions = null
    writeApi = {}
    queryApi = {}

    constructor({baseUrl, password, username, timeout = 10 * 1000, transportOptions}) {
        if (!baseUrl || typeof baseUrl !== "string") {
            throw new Error(`baseUrl is absent or invalid`)
        }
        if (!username || typeof username !== "string") {
            throw new Error(`username is absent or invalid`)
        }
        if (!password || typeof password !== "string") {
            throw new Error(`password is absent or invalid`)
        }
        this.#baseUrl = baseUrl
        this.#username = username
        this.#password = password
        this.#timeout = timeout
        this.#transportOptions = transportOptions
        this.#initClients()
    }

    #initClients() {
        this.#baseClient = new InfluxDB({
            url: this.#baseUrl,
            timeout: this.#timeout,
            transportOptions: this.#transportOptions
        })
        this.#pingApi = new PingAPI(this.#baseClient)
        this.#setupApi = new SetupAPI(this.#baseClient)
        this.#authApi = new AuthorizationsAPI(this.#baseClient)
        this.#signInApi = new SigninAPI(this.#baseClient)
        this.#orgsApi = new OrgsAPI(this.#baseClient)
        this.#signOutApi = new SignoutAPI(this.#baseClient)
    }

    async createWriteApi(apiName, org, bucket, defaultTags = {}) {
        const {token} = await this.#setup(org, bucket)
        const client = new InfluxDB({url: this.#baseUrl, token: token})
        if (this.writeApi[apiName]) {
            throw new Error(`writeApi with name '${apiName}' already exists`)
        }
        this.writeApi[apiName] = client.getWriteApi(org, bucket)
        this.writeApi[apiName].useDefaultTags(defaultTags)
    }

    async createQueryApi(apiName, org, bucket) {
        const {token} = await this.#setup(org, bucket)
        const client = new InfluxDB({url: this.#baseUrl, token: token})
        if (this.writeApi[apiName]) {
            throw new Error(`writeApi with name '${apiName}' already exists`)
        }
        this.queryApi[apiName] = client.getQueryApi(org)
    }

    async write({apiName, measurement, tagObj = {}, fieldObj = {}, timestamp = moment() * 1000000}) {
        if (!this.writeApi[apiName]) {
            throw new Error(`writeApi with name '${apiName}' does not exist`)
        }
        let point = new Point(measurement).timestamp(timestamp)
        this.#useTagSet(point, tagObj)
        this.#useFieldSet(point, fieldObj)
        this.writeApi[apiName].writePoint(point)
        await this.writeApi[apiName].flush(true)
    }

    async closeWriteApi(apiName) {
        if (!this.writeApi[apiName]) {
            throw new Error(`writeApi with name '${apiName}' does not exist`)
        }
        return await this.writeApi[apiName].close
    }

    #useTagSet(point, tagObj) {
        return Object.keys(tagObj).reduce((prev, tag) => {
            return prev.tag(tag, tagObj[tag])
        }, point)
    }

    #useFieldSet(point, fieldObj) {
        return Object.keys(fieldObj).reduce((prev, field) => {
            return this.#useField(field, fieldObj[field])(prev)
        }, point)
    }


    #useField(field, value) {
        switch (typeof value) {
            case "boolean":
                return (point) => point.booleanField(field, value)
            case "number":
                if (Number.isInteger(value)) {
                    return (point) => point.intField(field, value)
                }
                return (point) => point.floatField(field, value)
            case "string":
                return (point) => point.stringField(field, value)
            default:
                throw new Error(`Type of field '${field}' is not acceptable: ${value}`)
        }
    }

    async #auth(org) {
        const cookies = []
        await this.#signInApi.postSignin(
            {auth: {user: this.#username, password: this.#password}},
            {
                responseStarted: (headers, status) => {
                    if (status < 300) {
                        const setCookie = headers['set-cookie']
                        if (typeof setCookie === 'string') {
                            cookies.push(setCookie.split(';').shift())
                        } else if (Array.isArray(setCookie)) {
                            setCookie.forEach(c => cookies.push(c.split(';').shift()))
                        }
                    }
                },
            }
        )
        const session = {headers: {cookie: cookies.join('; ')}}
        const authorizations = await this.#authApi.getAuthorizations({org: org, user: this.#username}, session)
        let token = false;
        (authorizations.authorizations || []).forEach(auth => {
            token = auth.token
        })
        if (!token) {
            const orgsResponse = await this.#orgsApi.getOrgs({org}, session)
            if (!orgsResponse.orgs || orgsResponse.orgs.length === 0) {
                throw new Error(`No organization named ${org} found!`)
            }
            const orgID = orgsResponse.orgs[0].id
            const auth = this.#authApi.postAuthorizations(
                {
                    body: {
                        description: `${org}_token`,
                        orgID,
                        permissions: [
                            {
                                action: 'read',
                                resource: {type: 'buckets', orgID},
                            },
                            {
                                action: 'write',
                                resource: {type: 'buckets', orgID},
                            },
                        ],
                    },
                },
                session
            )
            token = auth.token
        }
        await this.#signOutApi.postSignout(undefined, session)
        return {
            token: token
        }
    }

    async #setup(org, bucket) {
        const setupData = await this.#setupApi.getSetup()
        if (setupData.allowed) {
            const {auth} = await this.#setupApi.postSetup({
                body: {
                    org,
                    bucket,
                    password: this.#password,
                    username: this.#username,
                },
            })
            if (!auth.token) {
                throw new Error("No token in 'auth' postSetup request.")
            }
            return {
                token: auth.token
            }
        } else {
            return await this.#auth(org)
        }
    }

    ping() {
        return this.#pingApi
            .getPing()
            .then(() => {
                console.log('Influxdb Ping SUCCESS')
            })
            .catch(error => {
                console.error(error)
            })
    }

    query({apiName, fluxQuery, observer}) {
        if (!this.queryApi[apiName]) {
            throw new Error(`queryApi with name '${apiName}' does not exist`)
        }
        return this.queryApi[apiName].queryRows(fluxQuery, observer);
    }
}

module.exports = {
    InfluxdbClient
}