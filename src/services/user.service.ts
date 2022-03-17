import { Security } from './../models/security';
import { IDBSelect } from "../interfaces/idb.interface";
import { ISecurity } from "../interfaces/isecurity";
import { IUser } from "../interfaces/user.interface";
import { DBService } from "./dbservice";
import * as CryptoJS from 'crypto-js';

export class UserService {
    constructor() {
    }

    async create_db_user(user: IUser) {
        const db = new DBService();
        let results = await db.insert_object(user, 'dbuser', "dassworddb", "user_id");
        let result = await this.get_db_user(results.rows[0]);
        await this.refresh_security(result);
        return result;
    }

    async get_db_user(minimum_user_object: IUser) {
        const db = new DBService();
        let _user: IDBSelect<IUser> = {
            "*": minimum_user_object
        }
        let results = await db.get_object<IUser>(_user, "AND", 'dbuser');
        if (results.rows[0]) {
            return this.parse_user(results.rows[0]);
        }
        return null;
    }

    async update_db_user(user: IUser, newuser: IUser) {
        const db = new DBService();
        let results = await db.update_object<IUser>(newuser, user, 'dbuser');
        let result = await this.get_db_user(user);
        return result;
    }


    async delete_db_user(user: IUser) {
        const db = new DBService();
        let results = await db.delete_object<IUser>(user, "AND", 'dbuser');
        return results;
    }

    //#region Authentication

    async registerUser(secureAuthObject) {
        let securityService = new Security();
        let minimumUser;
        try {
            minimumUser = securityService.authenticate(secureAuthObject)
        } catch (error) {
            throw new Error("Failed to authenticate");
        }
        minimumUser.meta = secureAuthObject.meta||{}
        return this.create_db_user(minimumUser)
    }

    async authenticatUser(secureAuthObject) {
        let securityService = new Security();
        let minimumUser;
        try {
            minimumUser = securityService.authenticate(secureAuthObject)
        } catch (error) {
            throw new Error("Failed to authenticate");
        }
        const user = await this.get_db_user(minimumUser);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    async refresh_security(user: IUser) {
        user.secure_hash = this.parseUserSecurity(user);
    }

    parseUserSecurity(user: IUser) {
        let secure_hash = this.parse_if_string<ISecurity>(user.secure_hash);
        secure_hash = new Security(secure_hash)
        try {
            secure_hash = typeof secure_hash === "string" ? JSON.parse(secure_hash) : secure_hash;
        } catch (error) {
            throw new Error("Security string could not be parsed");
        }
        return secure_hash;
    }
    //#endregion

    //#region User parser
    parse_user(user: IUser) {
        try {
            user.secure_hash = this.parse_if_string(user.secure_hash) as any;
            user.meta = this.parse_if_string(user.meta) as any;
            return user;
        } catch (error) {
            return user
        }
    }

    parse_if_string<T = any>(str: string | object): T {
        let temp = str;
        if (str && typeof str === "string") {
            try {
                temp = JSON.parse(str);
            } catch (error) {
                temp = str;
            }
        } else {
            temp = str;
        }
        return (temp as any);
    }
}