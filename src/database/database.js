
import pg from 'pg';

const { Pool } = pg;

const user = "postgres";
const password = "123456";
const host = 'localhost';
const port_database = 5432;
const database = 'mywallet';


const databaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
}

function connect(){
  if (process.env.DATABASE_URL) {
    const connection = new Pool(databaseConfig);
    return connection;
  }
  else {
    const connection = new Pool({
      user,
      password,
      host,
      port_database,
      database
    });
    return connection;
  }
}

const connection = connect();
export default connection