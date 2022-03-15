import { Filelike, getFilesFromPath, Web3Storage } from 'web3.storage'

export class Web3Store {
    constructor() {
    }

    private getAccessToken() {
        return process.env.WEB3STORAGE_TOKEN
    }

    private makeStorageClient() {
        return new Web3Storage({ token: this.getAccessToken() });
    }

    async getStatus(cid) {
        const client = this.makeStorageClient();
        const status = await client.status(cid);
        return status;
    }

    /** Get a list of all files in the 
        * @param {object} [opts]
        * @param {string} [opts.before] list items uploaded before this ISO 8601 date string
        * @param {number} [opts.maxResults] maximum number of results to return
    */
    async listUploads(opts?) {
        const client = this.makeStorageClient()
        var list = [];
        for await (const upload of client.list(opts)) {
            list.push(upload);
        }
        return list;
    }

    async retrieve(cid) {
        const client = this.makeStorageClient()
        const res = await client.get(cid)
        console.log(`Got a response! [${res.status}] ${res.statusText}`)
        if (!res.ok) {
            throw new Error(`failed to get ${cid}`)
        }

        return res;
    }

    async retrieveFiles(cid) {
        const client = this.makeStorageClient()
        const res = await client.get(cid)
        console.log(`Got a response! [${res.status}] ${res.statusText}`)
        if (!res.ok) {
            throw new Error(`failed to get ${cid} - [${res.status}] ${res.statusText}`)
        }

        const files = await res.files();
        return files;
    }

    /** File objects from a json opject */
    makeFileObject(obj, fileName) {
        const buffer = Buffer.from(JSON.stringify(obj));
        return new File([buffer], fileName)
    }

    async getFiles(path) {
        const files = await getFilesFromPath(path)
        console.log(`read ${files.length} file(s) from ${path}`)
        return files
    }

    async storeFiles(files:Filelike) {
        const client = this.makeStorageClient()
        const cid = await client.put([files],{
            maxRetries:10,
            wrapWithDirectory:false
        })
        console.log('stored files with cid:', cid)
        return cid;
    }
}