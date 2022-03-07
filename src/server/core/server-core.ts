import express from "express";
import fileUpload from "express-fileupload";


export default class MainServerCore {

    app = express();
    port = process.env.NODEJS_PORT || 3005;

    constructor() {
    }

    setupMiddleware() {

        this.app.use(fileUpload({
            limits: {
                fileSize: 25 * 1024 * 1024, // limit max upload size to 25 mb to save ram memory
            }
        }));

        this.app.set('trust proxy', true);

        // json request and response
        this.app.use(express.json());

        // setup cors
        this.app.use(function (req, res, next) {
            let host = req.hostname;
            res.setHeader('content-type', 'application/json');
            res.setHeader('charset', 'utf-8')
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type, Accept,Authorization,Origin");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            next();
        });

        // preflight handler
        this.app.options('*');
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log("==== This is nodejs app ====");

            console.log(`App listening at http://localhost:${this.port}`)
        })
    }

}