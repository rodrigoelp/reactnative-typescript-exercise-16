/// <reference types='pouchdb-core' />

declare module "pouchdb-react-native" {
    const pouchdb: PouchDB.Static;
    export default pouchdb;
}

declare var PouchDB: PouchDB.Static;