import { IDBSelect } from "../interfaces/idb.interface";
import { IDBUser } from "../interfaces/user.interface";
import { DBSecurity } from "../models/security";
import { DBService } from "./dbservice";

export class UserService {
    constructor() {
    }

    async create_db_user(user: IDBUser) {
        const db = new DBService();
        let results = await db.insert_object(user, 'dbuser');
        let result = await this.get_db_user(results.rows[0]);
        await this.refresh_security(result);
        return result;
    }

    async get_db_user(minimum_user_object: IDBUser) {
        const db = new DBService();
        let _user: IDBSelect<IDBUser> = {
            "*": minimum_user_object
        }
        let results = await db.get_object<IDBUser>(_user, "AND", 'dbuser');
        return this.parse_user(results.rows[0]);
    }

    async update_db_user(user: IDBUser, newuser: IDBUser) {
        const db = new DBService();
        let results = await db.update_object<IDBUser>(newuser, user, 'dbuser');
        let result = await this.get_db_user(user);
        return result;
    }


    async delete_db_user(user: IDBUser) {
        const db = new DBService();
        let results = await db.delete_object<IDBUser>(user, "AND", 'dbuser');
        return results;
    }

    //#region secuiry
    async refresh_security(user: IDBUser) {
        user.security_hash = this.get_user_security(user);
    }

    get_user_security(user: IDBUser) {
        let security_hash = new DBSecurity(user.security_hash);
        try {
            security_hash = typeof security_hash === "string" ? JSON.parse(security_hash) : security_hash;
        } catch (error) {
            throw new Error("Security string could not be parsed");
        }
        return security_hash;
    }

    //#region User parser
    parse_user(user: IDBUser) {
        try {
            user.security_hash = this.parse_if_string(user.security_hash) as any;
            user.meta = this.parse_if_string(user.meta) as any;
            return user;
        } catch (error) {
            return user
        }
    }

    parse_if_string(str: string | object) {
        let temp = str;
        if (str && typeof str === "string") {
            try {
                temp = JSON.parse(str);
            } catch (error) {
                console.error(error);
                temp = str;
            }
        } else {
            temp = str;
        }
        return temp;
    }
}