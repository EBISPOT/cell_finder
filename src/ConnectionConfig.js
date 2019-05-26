
import { v1 as neo4j } from "neo4j-driver";
// import elasticsearch from "elasticsearch";
const { Client } = require('@elastic/elasticsearch')


import dotenv from "dotenv";

// set environment variables from ../.env
dotenv.config();


class EsClient {
    constructor () {
        this.es = new Client({
            node: 'http://localhost:9200',
            log: 'trace'
        });
    }

    get_session() {
        return this.es;
    }


}

class NeoClient {
    constructor () {
        this.neo = neo4j.driver(
         process.env.NEO4J_URI || "bolt://localhost:7687",
         neo4j.auth.basic(
             process.env.NEO4J_USER || "neo4j",
             process.env.NEO4J_PASSWORD || "letmein"
         ));
    }

    get_session() {
        return this.neo.session()
    }


}

module.exports = {NeoClient, EsClient};