import * as express from 'express';
import Controller from "./core/controller";
import { Application } from "express";
import http from "http";
import { DataSource } from "typeorm";
import { dataSourceOptions } from "./conf/datasource";

class App {
    public readonly app: express.Application;
    private server!: http.Server;
    private dataSource: DataSource;
    public port: number;
    private controllers: Controller[];
    private readonly controllersCallback: (app: App) => Controller[];

    get getApp(): Application {
        return this.app;
    }

    get getServer(): http.Server {
        return this.server;
    }

    getDataSource() {
        return this.dataSource;
    }

    constructor(callback: (app: App) => Controller[], port: number) {
        this.app = express();
        this.port = port;
        this.controllersCallback = callback;
    }

    public async init() {
        await this.initializeControllers();
    }

    private async initializeControllers() {
        this.dataSource = new DataSource(dataSourceOptions);
        await this.dataSource.initialize().then(() => {
            this.controllers = this.controllersCallback(this);
            this.controllers.forEach((controller) => {
                this.app.use('/', controller.router);
            });
        });
    }

    public async close() {
        if (this.server) {
            this.server.close();
        }
    }

    public async listen() {
        this.server = this.app.listen(this.port, () => {
            console.log(`🚀 Server is running on port ${this.port}`);
        });

        return this.app;
    }
}

export default App;
