import { VideoQualityMode } from 'discord.js'
import {
  MongoClient,
  type Collection,
  type DeleteResult,
  type Document,
  type Filter,
  type WithId,
} from 'mongodb'

class MongoCollection<T extends Document> {

  readonly collection: Collection<T>
  readonly client: MongoClient
  readonly name: string

  /**
   * MongoDB collection wrapper
   * @param client - MongoDB client to use
   * @param name - Name of MongoDB collection
   */
  constructor(client: MongoClient, name: string) {
    const database = client.db(client.options.dbName || 'doorman')

    this.collection = database.collection<T>(name)
    this.client = client
    this.name = name

    return this
  }

  /**
   * Find a document by ID or filter
   * @param filter - A string ID or a filter object
   * @param projection - Fields to return
   *
   * @see https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/project/
   */
  async get(filter: Filter<T> | string, projection?: Partial<T>): Promise<WithId<T> | null> {
    if (typeof filter === 'string') {
      filter = { _id: filter } as Filter<T>
    }

    return await this.collection.findOne(filter, {
      ...(projection && { projection })
    })
  }

  /**
   * Update or create a document
   * @param filter - A string ID or filter object
   * @param fields - Dot-notated fields to update and their new values
   */
  async set(filter: Filter<T> | string, fields: Partial<T>): Promise<WithId<T> | null> {
    if (typeof filter === 'string') {
      filter = { _id: filter } as Filter<T>
    }

    return await this.collection.findOneAndUpdate(
      filter,
      { $set: fields },
      {
        upsert: true,
        includeResultMetadata: false
      }
    )
  }

  /**
   * Delete a document
   * @param filter - Document ID or filter object
   */
  async delete(filter: Filter<T> | string): Promise<DeleteResult> {
    if (typeof filter == 'string')
      filter = { _id: filter } as Filter<T>

    return await this.collection.deleteMany(filter)
  }
}

if (!process.env.DATABASE) {
  throw Error("No MongoDB connection string provided.\nPlease specify 'DATABASE' environment variable.")
}

const client = new MongoClient(process.env.DATABASE, {
  retryWrites: true,
  writeConcern: {
    w: 'majority'
  }
})

client.connect()

export interface SessionSchema {
  hub: string,
  host: string,
  guild: string,
}

export interface HistorySchema {
  bitrate?: number,
  name?: string,
  nsfw?: boolean,
  parent?: string,
  permissions?: {
    [key: string]: {
      type: 0 | 1,
      deny?: bigint,
      allow?: bigint
    }
  }
  rateLimitPerUser?: number,
  rtcRegion?: string | null,
  userLimit?: number,
  videoQualityMode?: VideoQualityMode,
}

export interface HubSchema {
  guild: string,
  defaults: HistorySchema,
}

export const hubs = new MongoCollection<HubSchema>(client, 'hubs')
export const history = new MongoCollection<HistorySchema | SessionSchema>(client, 'history')
export const session = new MongoCollection<SessionSchema>(client, 'session')
