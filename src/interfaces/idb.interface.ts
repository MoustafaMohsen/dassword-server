import { ISecurity } from "./isecurity";

export interface IDBSelect<T=any>{
    "*"?: T,
    [key:string]:T
}

export interface IEnctyptedDBObject {
    /** The encrypted DB stringfied object */
    data: string;
  }
  
  
  export interface IDBTransfer {
    secureAuthObject: ISecurity,
    db_version: number
  }
  
  