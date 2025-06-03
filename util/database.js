import { MongoClient } from 'mongodb'

class MongoCollection {

  /**
   * MongoDB collection of documents
   * @param {MongoClient} client MongoDB client to use
   * @param {string} name Name of MongoDB collection
   */
  constructor(client, name) {
    this.collection = client.db(client.options.dbName || 'doorman').collection(name)

    this.client = client
    this.name = name

    return this
  }

  /**
   * Find a document
   * @param {string|import('mongodb').Filter<import('mongodb').Document>} filter Document ID or filter object
   * @param {Object} projection The fields to return. See [projection](https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/project/)
   * @returns {Promise<?import('mongodb').Document>}
   */
  async get(filter, projection) {
    if (typeof filter == 'string')
      filter = { _id: filter }

    return await this.collection.findOne(
      filter,
      { projection }
    )
  }

  /**
   * Update or create a document
   * @param {string|import('mongodb').Filter<import('mongodb').Document>} filter Document ID or filter object
   * @param {import('mongodb').MatchKeysAndValues<import('mongodb').Document>} fields Dot-notated fields to update and their new values
   * @returns {Promise<import('mongodb').Document>}
   */
  async set(filter, fields) {
    if (typeof filter == 'string')
      filter = { _id: filter }

    return await this.collection.findOneAndUpdate(
      filter,
      { $set: fields },
      { upsert: true }
    )
  }

  /**
   * Delete a document
   * @param {string|import('mongodb').Filter<import('mongodb').Document>} filter Document ID or filter object
   * @returns {Promise<void>}
   */
  async delete(filter) {
    if (typeof filter == 'string')
      filter = { _id: filter }

    return await this.collection.deleteMany(filter)
  }
}

const client = new MongoClient(process.env.DATABASE, {
  retryWrites: true,
  writeConcern: 'majority',
  useNewUrlParser: true,
  useUnifiedTopology: true
})

client.connect()

export const hubs = new MongoCollection(client, 'hubs')
export const history = new MongoCollection(client, 'history')
export const session = new MongoCollection(client, 'session')
