const mongoose = require('mongoose');

const FALLBACK_URI = 'mongodb://localhost:27017/nodetask';
const DEFAULT_DB_NAME = process.env.DB_NAME || 'nodetask';

const getConnectOptions = (uri) => {
  const options = {
    serverSelectionTimeoutMS: 5000,
  };

  const hasDatabaseName = /mongodb(?:\+srv)?:\/\/[^/]+\/[^?]+/.test(uri);
  if (!hasDatabaseName) {
    options.dbName = DEFAULT_DB_NAME;
  }

  return options;
};

const logConnection = (conn) => {
  console.log(`DB connected 🌳`);
};

const connect = async () => {
  let uri = process.env.MONGO_URI || FALLBACK_URI;

  if (uri.includes('<db_password>') || uri.includes('%3Cdb_password%3E')) {
    uri = FALLBACK_URI;
  }

  try {
    const conn = await mongoose.connect(uri, getConnectOptions(uri));
    logConnection(conn);
    return conn;
  } catch (error) {
    if (uri !== FALLBACK_URI) {
      try {
        const conn = await mongoose.connect(FALLBACK_URI, getConnectOptions(FALLBACK_URI));
        logConnection(conn);
        return conn;
      } catch (fallbackError) {
        console.error(`DB connection failed: ${fallbackError.message}`);
      }
    } else {
      console.error(`DB connection failed: ${error.message}`);
    }

    process.exit(1);
  }
};

module.exports = { connect };
