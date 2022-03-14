import { IDBSecurity } from "./isecurity";

export interface IDBUser {
    email?: string;
    security_hash?: IDBSecurity;
    meta?: object;
}
