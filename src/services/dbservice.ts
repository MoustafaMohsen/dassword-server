import { Client, ClientConfig } from "pg";

export class DBService {
    dbsettings: ClientConfig = {
        // connectionString: process.env.DATABASE_URL,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        port:parseInt(process.env.DATABASE_PORT)
    }
    constructor(opts?: { host?: string; user?: string; password?: string; port?: number; database?}) {
        this.dbsettings = { ...this.dbsettings, ...(opts as any) };
    }



    async connect(database?) {
        const set = database ? { ...this.dbsettings, database } : this.dbsettings;
        const client = new Client(set);
        await client.connect();
        return client;
    }


    async createDB(client: Client, dbname = "dassworddb") {
        await client.query(`SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${dbname}'
        AND pid <> pg_backend_pid();`)
        await client.query("DROP DATABASE IF EXISTS " + dbname + ";")
        const query = `CREATE DATABASE ${dbname}`
        let result = await client.query(query);
        return result;
    }

    // ======= Create Tables


    async create_user_tabel(client: Client, tablename = "dbuser") {
        await client.query("DROP TABLE IF EXISTS " + tablename + ";")
        let result = await client.query(`CREATE TABLE IF NOT EXISTS ${tablename} (
            id SERIAL PRIMARY KEY,
            security_hash TEXT NOT NULL,
            email VARCHAR ( 255 ) NOT NULL UNIQUE,
            meta TEXT
);`)
        return result;
    }

    async create_share_tabel(client: Client, tablename = "dbshare") {
        await client.query("DROP TABLE IF EXISTS " + tablename + ";")
        let result = await client.query(`CREATE TABLE IF NOT EXISTS ${tablename} (
            id SERIAL PRIMARY KEY,
            owner_id SERIAL NOT NULL,
            reciver_id SERIAL NOT NULL,
            security_hash TEXT,
            meta TEXT
);`)
        return result;
    }


}