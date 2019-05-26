import {NeoClient} from "../ConnectionConfig";
import {Cell} from "../model/Cell";



class GraphService {
    constructor() {
        this.neo = new NeoClient();
    }

    runQuery(query) {
        let session = this.neo.get_session();

        let _query = query;
        return new Promise( (resolve, reject) => {

            session.run(_query, {})
                .then(function (result) {
                    resolve();
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
    }

    findAll() {

        let session = this.neo.get_session();
        let cellMap = new Map();

        return new Promise( (resolve, reject) => {

            session
                .run('MATCH (c:ONTOLOGY)-[r:SUBCLASSOF|RELATED]->(related:ONTOLOGY)\n' +
                    'WHERE c.namespace = {namespace}\n'+
                    'RETURN c.label as label, c.uri as uri, c.definition as definition, c.source as source, collect(distinct(c.synonym)) as synonyms, r.label as relation, collect(distinct related.uri) as related_uri', {namespace: 'cell'})
                .then(function (result) {

                    result.records.forEach(function (record) {

                        let cellUri = record.get('uri');
                        if (!cellMap.has(cellUri)) {
                            let cell = new Cell();
                            cell.label = record.get('label');
                            cell.uri = cellUri;
                            cell.definition = record.get('definition');
                            cell.source = record.get('source');
                            let all_synonyms = record.get('synonyms');

                            let synsSet = new Set();

                            all_synonyms.forEach(function (x) {
                                x.forEach(function (y) {
                                    synsSet.add(y)
                                });
                            });
                            cell.synonyms = Array.from(synsSet);

                            cellMap.set(cellUri, cell);
                        }

                        if (!(cellMap.get(cellUri)).related.has(record.get('relation'))) {
                            (cellMap.get(cellUri)).related.set(record.get('relation'), record.get('related_uri'))
                        }

                    });
                    session.close();
                    resolve(Array.from(cellMap.values()));
                })
                .catch(function (error) {
                    console.log(error);
                });
        });

    }

    decorateByRelation(cell, rel) {

        let termUri = cell.uri;
        let relName = rel;

        let session = this.neo.get_session();
        let cellCopy = cell;
        return new Promise( (resolve, reject) => {

            session
                .run('MATCH (c:ONTOLOGY)-[r:RELATED]->(related:ONTOLOGY)\n' +
                    'WHERE  c.uri = {termUri} and r.label = {rel}\n' +
                    'WITH related\n' +
                    'MATCH path = (related)-[:SUBCLASSOF*]->(:ONTOLOGY)\n' +
                    'UNWIND nodes(path) as all_related\n' +
                    'RETURN collect(distinct all_related.label)  as labels, collect(distinct all_related.synonym) as synonyms', {termUri: termUri, rel: relName })
                .then(function (result) {

                    if (result.records.length  > 1) {
                        reject("Only expected one result when querying to decorate by relation "+ rel +" for " + cell.uri)
                    }


                    let all_label =  result.records[0].get('labels');
                    let all_synonyms = result.records[0].get('synonyms');

                    let synsSet = new Set();

                    all_synonyms.forEach(function (x) {
                        x.forEach(function (y) {
                            synsSet.add(y)
                        });
                    });

                    cellCopy.related.set(rel + '_labels',all_label );
                    cellCopy.related.set(rel + '_synonyms',Array.from(synsSet) );

                    session.close();
                    resolve(cellCopy);
                })
                .catch(function (error) {
                    console.log(error);
                });
        });

    }

    decorateByDirectRelation(cell, rel) {

        let termUri = cell.uri;
        let relName = rel;

        let session = this.neo.get_session();
        let cellCopy = cell;
        return new Promise( (resolve, reject) => {

            session
                .run('MATCH (c:ONTOLOGY)-[r:RELATED]->(related:ONTOLOGY)\n' +
                    'WHERE  c.uri = {termUri} and r.label = {rel}\n' +
                    'RETURN collect(distinct related.label)  as labels, collect(distinct related.synonym) as synonyms', {termUri: termUri, rel: relName })
                .then(function (result) {

                    if (result.records.length  > 1) {
                        reject("Only expected one result when querying to decorate by relation "+ rel +" for " + cell.uri)
                    }


                    let all_label =  result.records[0].get('labels');
                    let all_synonyms = result.records[0].get('synonyms');

                    let synsSet = new Set();

                    all_synonyms.forEach(function (x) {
                        x.forEach(function (y) {
                            synsSet.add(y)
                        });
                    });

                    cellCopy.related.set(rel + '_labels',all_label );
                    cellCopy.related.set(rel + '_synonyms',Array.from(synsSet) );

                    session.close();
                    resolve(cellCopy);
                })
                .catch(function (error) {
                    console.log(error);
                });
        });

    }

    decorateParentTypes(cell) {

        let termUri = cell.uri;

        let session = this.neo.get_session();
        let cellCopy = cell;
        return new Promise( (resolve, reject) => {

            session
                .run('MATCH path = (c:ONTOLOGY)-[:SUBCLASSOF*]->(p:ONTOLOGY)\n' +
                    'WHERE c.uri = {termUri}\n' +
                    'RETURN collect(distinct p.label) as labels, collect(distinct p.synonym) as synonyms', {termUri: termUri })
                .then(function (result) {

                    if (result.records.length  > 1) {
                        reject("Only expected one result when querying tp decorate parent types for " + cell.uri)
                    }

                    let all_label = result.records[0].get('labels');
                    let all_synonyms = result.records[0].get('synonyms');

                    let synsSet = new Set();

                    all_synonyms.forEach(function (x) {
                        x.forEach(function (y) {
                            synsSet.add(y)
                        });
                    });
                    cellCopy.related.set('is_a_labels',all_label );
                    cellCopy.related.set('is_a_synonyms', Array.from(synsSet) );

                    session.close();
                    resolve(cellCopy);
                })
                .catch(function (error) {
                    console.log(error);
                });
        });

    }

    //
    //
    // findAll(callback) {
    //
    //
    //     let session = this.neo.get_session();
    //     let cellMap = new Map();
    //
    //     session
    //         .run('MATCH (c:ONTOLOGY)-[r:SUBCLASSOF|RELATED]->(related:ONTOLOGY)\n' +
    //             'WHERE c.namespace = {namespace}\n'+
    //             'RETURN c.label as label, c.uri as uri, c.definition as definition, c.source as source, collect(distinct(c.synonym)) as synonyms, r.label as relation, collect(distinct related.uri) as related_uri', {namespace: 'cell'})
    //         .subscribe({
    //             onNext: function (record) {
    //
    //                 let cellUri = record.get('uri');
    //                 if (!cellMap.has(cellUri)) {
    //                     let cell = new Cell();
    //                     cell.label = record.get('label');
    //                     cell.uri = cellUri;
    //                     cell.definition = record.get('definition');
    //                     cell.source = record.get('source');
    //                     let all_synonyms = record.get('synonyms');
    //
    //                     let synsSet = new Set();
    //
    //                     all_synonyms.forEach(function (x) {
    //                         x.forEach(function (y) {
    //                             synsSet.add(y)
    //                         });
    //                     });
    //                     cell.synonyms = Array.from(synsSet);
    //
    //                     cellMap.set(cellUri, cell);
    //                 }
    //
    //                 if (!(cellMap.get(cellUri)).related.has(record.get('relation'))) {
    //                     (cellMap.get(cellUri)).related.set(record.get('relation'), record.get('related_uri'))
    //                 }
    //             },
    //             onCompleted: function () {
    //                 session.close();
    //                 callback(Array.from(cellMap.values()));
    //
    //             },
    //             onError: function (error) {
    //                 console.log(error);
    //             }
    //         });
    // }

    // decorateByRelation(cell, rel, callback) {
    //
    //     let termUri = cell.uri;
    //     let relName = rel;
    //
    //     let session = this.neo.get_session();
    //     let cellCopy = cell;
    //     let allCells = Array();
    //     return new Promise( (resolve, reject) => {
    //
    //         session
    //             .run('MATCH path = (c:ONTOLOGY)-[:SUBCLASSOF*]->(:ONTOLOGY)\n' +
    //                 'WHERE  c.uri = {termUri}\n' +
    //                 'UNWIND nodes(path) as parents\n' +
    //                 'MATCH (parents)-[r:RELATED]->(related:ONTOLOGY)\n' +
    //                 'WHERE r.label = {rel}\n' +
    //                 'WITH related\n' +
    //                 'MATCH path = (related)-[:SUBCLASSOF*]->(:ONTOLOGY)\n' +
    //                 'UNWIND nodes(path) as all_related\n' +
    //                 'RETURN collect(distinct all_related.label)  as labels, collect(distinct all_related.synonym) as synonyms', {termUri: termUri, rel: relName })
    //             .subscribe({
    //                 onNext: function (record) {
    //
    //
    //                     let all_label = record.get('labels');
    //                     let all_synonyms = record.get('synonyms');
    //
    //                     let synsSet = new Set();
    //
    //                     all_synonyms.forEach(function (x) {
    //                         x.forEach(function (y) {
    //                             synsSet.add(y)
    //                         });
    //                     });
    //
    //                     cellCopy.related.set(rel + '_labels',all_label );
    //                     cellCopy.related.set(rel + '_synonyms',Array.from(synsSet) )
    //                     allCells.push(cellCopy)
    //                 },
    //                 onCompleted: function () {
    //                     session.close();
    //                     callback(allCells)
    //                 },
    //                 onError: function (error) {
    //                     console.log(error);
    //                 }
    //             });
    //     });
    //
    // }

    // decorateParentTypes2(cell, callback) {
    //
    //     let termUri = cell.uri;
    //
    //     let session = this.neo.get_session();
    //     let cellCopy = cell;
    //     let allCells = Array();
    //
    //     session
    //         .run('MATCH path = (c:ONTOLOGY)-[:SUBCLASSOF*]->(p:ONTOLOGY)\n' +
    //             'WHERE c.uri = {termUri}\n' +
    //             'RETURN collect(distinct p.label) as labels, collect(distinct p.synonym) as synonyms', {termUri: termUri })
    //         .subscribe({
    //             onNext: function (record) {
    //
    //                 console.log(".");
    //                 let all_label = record.get('labels');
    //                 let all_synonyms = record.get('synonyms');
    //
    //                 let synsSet = new Set();
    //
    //                 all_synonyms.forEach(function (x) {
    //                     x.forEach(function (y) {
    //                         synsSet.add(y)
    //                     });
    //                 });
    //                 cellCopy.related.set('is_a_labels',all_label );
    //                 cellCopy.related.set('is_a_synonyms', Array.from(synsSet) );
    //                 allCells.push(cellCopy)
    //             },
    //             onCompleted: function () {
    //                 session.close();
    //                 callback(allCells)
    //             },
    //             onError: function (error) {
    //                 console.log(error);
    //             }
    //         });
    // }

}

module.exports = {GraphService};
