import { Web3Store } from './../services/web3-storage';
import performance from "perf_hooks";
import express from "express";
import MainServerCore from './core/server-core';
import { DBService } from "../services/dbservice";

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

        this.app.post('/ipfs/store/', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            try {
                const web3 = new Web3Store();
                if (!req.files || Object.keys(req.files).length === 0) {
                    return err(res, 'No files were uploaded.', t0);
                }
                data = await web3.storeFiles(req.files.encrypteddb);
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })

    }

}