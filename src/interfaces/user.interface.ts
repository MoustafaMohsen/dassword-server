import { ISecurity } from "./isecurity";

export interface IUser {
    user_id?: string;
    email?: string;
    db_cid?: string;
    db_version?: string;
    secure_hash?: ISecurity;
    meta?: object;
}
