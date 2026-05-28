import mongoose from 'mongoose'
import dns from 'node:dns/promises'

dns.setServers(['1.1.1.1', '8.8.8.8'])

let cachedConnection = null

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables')
  }

  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })

  cachedConnection = conn

  console.log(`MongoDB connected: ${conn.connection.host}`)
  console.log(`MongoDB database: ${conn.connection.name}`)

  return conn
}

export default connectDB