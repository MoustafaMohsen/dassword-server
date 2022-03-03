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

    async PrepareDB(dbname = "dassworddb") {
        // database will be created manually
        let result: any = {}
    
        this.dbsettings.database = dbname;
        const client2 = await this.connect();
        result.create_user_tabel = await this.create_user_tabel(client2);
        result.create_share_tabel = await this.create_share_tabel(client2);
        await client2.end();
        delete this.dbsettings.database;
        console.log("DB is ready");
        return result;
    }

    async create_index(client: Client, tablename, columnname) {
        const query = `CREATE INDEX idx_${tablename}_${columnname} 
        ON ${tablename}(${columnname});`
        return await client.query(query);
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