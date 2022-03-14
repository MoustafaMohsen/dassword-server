import { IDBSecurity } from "../interfaces/isecurity";

export class DBSecurity implements IDBSecurity {
    constructor(security?:IDBSecurity) {
        if (security) {
            if (security.login) {
                this.login = {
                    ...this.login,
                    ...security.login
                }
            }
        }
    }
    
    login = {
    
        data: null,
        _sandbox: true,

    };
}