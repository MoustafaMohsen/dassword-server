export interface IDBSelect<T=any>{
    "*"?: T,
    [key:string]:T
}