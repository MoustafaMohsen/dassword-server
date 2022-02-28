import MainServerRoutes from '../server-routes';


export default class MainServer extends MainServerRoutes {

    init() {
        this.setupMiddleware();
        this.setupRoute();
        this.listen();
    }
}