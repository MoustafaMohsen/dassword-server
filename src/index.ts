import MainServer from "./server/core/server-init";

try {
    const server = new MainServer();
    server.init();
    console.log("===Envs===");
    console.log(process.env.DATABASE_URL)
    console.log(process.env.DATABASE_USER)
    console.log(process.env.DATABASE_PASSWORD)
    console.log(process.env.DATABASE_HOST)
    console.log(process.env.DATABASE_NAME)
    console.log(process.env.EXECUTE_ACTIONS_EVERY_MINUTES)
    
     
} catch (error) {
    console.log(error);
    
}