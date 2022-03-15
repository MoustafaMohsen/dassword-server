import { HelperService } from './../services/util/helper';
import { IUser } from './../interfaces/user.interface';
import { Web3Store } from './../services/web3-storage';
import performance from "perf_hooks";
import express from "express";
import MainServerCore from './core/server-core';
import { DBService } from "../services/dbservice";
import { UserService } from '../services/user.service';
import * as fs from 'fs';
import * as stream from 'stream';
import { UploadedFile } from 'express-fileupload';
import { Base64 } from 'js-base64';

export default class MainServerRoutes extends MainServerCore {

    setupRoute() {

        function send(res: express.Response, data, t0) {
            let pre = performance.performance.now() - t0;
            console.log(`-->Request for:'${res.req.path}', from client:'${res.req.ip}' took:${pre}ms`);
            if (!res.headersSent) {
                res.send(JSON.stringify({ performance: pre, success: true, data }))
            } else {
                res.write(JSON.stringify({ performance: pre, success: true, data }));
                res.end();
            }
        }

        function err(res: express.Response, message, t0, statuscode = 400) {
            // res.status(statuscode);
            let pre = performance.performance.now() - t0;
            console.log(`-->Request errored for:'${res.req.path}', from client:'${res.req.ip}' took:${pre}ms`);
            console.error(message);
            res.send(JSON.stringify({ data: {}, response_status: 400, message, performance: pre, success: false }))
        }

        //#region Admin Area
        this.app.get('/', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            try {
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.get('/admin/test-db', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            const db = new DBService();
            try {
                data.result = (await db.connect());
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/admin/prepare-db/' + process.env.APP_SECRET_KEY, async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            const db = new DBService();
            try {
                data.result = { ...(await db.PrepareDB(req.body.database)) };
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        //#endregion



        this.app.post('/register', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const userSrv = new UserService();
                let secureAuthObject: IUser = req.body.encrypted_data;
                userSrv.registerUser(secureAuthObject).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })


        this.app.post('/login', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const userSrv = new UserService();
                let secureAuthObject: IUser = req.body.encrypted_data;
                userSrv.authenticatUser(secureAuthObject).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/delete-db-user', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const userSrv = new UserService();
                let body: IUser = req.body;
                userSrv.delete_db_user(body).then((d) => {
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })


        this.app.post('/ipfs/list-all-files/' + process.env.APP_SECRET_KEY, async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            const web3 = new Web3Store();
            try {
                data = await web3.listUploads();
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/ipfs/retrive/', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            const web3 = new Web3Store();
            try {
                data = await web3.retrieve(req.body.cid);
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/ipfs/store/db/', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            try {
                // authenticate user
                const userSrv = new UserService();
                const user = await userSrv.authenticatUser(req.body.secureAuthObject)
                if (!req.files?.encrypteddb?.['data']) throw new Error("No Db file was attached");

                const dbFile = req.files.encrypteddb as UploadedFile;
                if (!user) throw new Error("No user found");

                const buffer = Buffer.from(dbFile.data);
                const theStream = () => stream.Readable.from(buffer);

                let node_file: any = {
                    name: dbFile.name,
                    stream: theStream
                }
                const web3 = new Web3Store();
                const cidString = await web3.storeFiles(node_file);
                user.db_cid = cidString;
                user.db_version = HelperService.makeid();
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/ipfs/retrive/db/', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                if (!req.body.user_id) throw new Error("User data was not attached");

                // authenticate user
                const userSrv = new UserService();
                const user = await userSrv.authenticatUser(req.body.secureAuthObject)

                const web3 = new Web3Store();
                const response = await web3.retrieve(user.db_cid);
                var files = await response.files();
                const file = files[0];

                if (!file) throw new Error("Db file was not found");
                
                // the following conversion supports arabic characters, emojis and Chinese and asian character
                // File ==> ArrayBuffer ==> Base64 ==> String ==> Object

                // Conver file to ArrayBuffer
                let buffer = await file.arrayBuffer();

                // Convert ArrayBuffer to Base64
                var blob_file = new Blob([buffer], { type: 'text/plain' });
                var base64_str = await blob_file.text();

                // Conver Base64 to String
                let enctyptedStringfiedDBObject = Base64.decode(base64_str)
                
                // Converty String to Object
                let enctyptedDBObject = JSON.parse(enctyptedStringfiedDBObject);
          
                send(res, enctyptedDBObject, t0)

            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/ipfs/retrive/file/', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                if (!req.body.user_id) throw new Error("User data was not attached");

                const user_id = req.body.user_id;
                const fileCid = req.body.fileCid;
                // get user from db record
                const userSrv = new UserService();
                let user = await userSrv.get_db_user({ user_id });
                if (!user) throw new Error("No user found");

                const web3 = new Web3Store();
                const response = await web3.retrieve(fileCid);
                var files = await response.files();
                const file = files[0];

                //tell the browser to download this
                res.setHeader('Content-disposition', 'attachment; filename=' + file.name);
                res.setHeader('Content-type', file.type);

                //convert to a buffer and send to client
                let buffer = await file.arrayBuffer();
                res.status(200).send(buffer)

            } catch (error) {
                err(res, error, t0)
            }
        })

    }

}