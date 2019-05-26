
import {GraphService} from "./service/GraphService";
import {SearchService} from "./service/SearchService";

let gs = new GraphService();
let ss = new SearchService();


let createIndex = "CREATE CONSTRAINT ON (o:ONTOLOGY) ASSERT o.uri IS UNIQUE";

let createIndex2 = "CREATE INDEX ON :ONTOLOGY(namespace)";

let loadTerms = "USING PERIODIC COMMIT 10000\n" +
    "LOAD CSV WITH HEADERS FROM \"file:///all_terms.csv\" AS line\n" +
    "WITH line\n" +
    "MERGE (c:ONTOLOGY {uri : line.id}) \n" +
    "ON CREATE SET c.label =  line.label, c.namespace = line.namespace, c.synonym = [], c.definition = line.definition, c.source = \"cell type ontology\"\n" +
    "ON MATCH SET c.synonym = c.synonym + line.synonym ;\n";

let loadParentChild = "USING PERIODIC COMMIT 10000\n" +
    "LOAD CSV WITH HEADERS FROM \"file:///parent_terms.csv\" AS line\n" +
    "WITH line\n" +
    "MATCH (c:ONTOLOGY {uri : line.s}), (p:ONTOLOGY {uri : line.p})\n" +
    "MERGE (c)-[r:SUBCLASSOF {uri: 'http://www.w3.org/2000/01/rdf-schema#subClassOf'}]->(p)\n" +
    "WITH r, line\n" +
    "SET r.label = \"is_a\";";

let loadRelated = "USING PERIODIC COMMIT 10000\n" +
    "LOAD CSV WITH HEADERS FROM \"file:///related_terms.csv\" AS line\n" +
    "WITH line\n" +
    "MATCH (c:ONTOLOGY {uri : line.s}), (p:ONTOLOGY {uri : line.rel_term})\n" +
    "MERGE (c)-[r:RELATED {uri: line.rel}]->(p)\n" +
    "WITH r, line\n" +
    "SET r.label = replace(line.rel_label, \" \", \"_\");\n";

let remove = "LOAD CSV WITH HEADERS FROM \"file:///remove.txt\" AS line\n" +
    "WITH line\n" +
    "MATCH (c:ONTOLOGY) WHERE c.uri= line.uri \n" +
    "OPTIONAL MATCH (c:ONTOLOGY)-[r]-() DELETE c,r";

async function run () {

    console.log("Creating index..");
    await gs.runQuery(createIndex);
    await gs.runQuery(createIndex2);

    console.log("Loading terms..");
    await gs.runQuery(loadTerms);
    console.log("Loading parent/child relationships..");
    await gs.runQuery(loadParentChild);
    console.log("Loading other relationships..");
    await gs.runQuery(loadRelated);

    console.log("Removing unwanted terms..");
    await gs.runQuery(remove);

    const all_cells = await gs.findAll();
    for (let cell of all_cells) {

        try {
            cell = await gs.decorateParentTypes(cell);
            cell = await gs.decorateByRelation(cell, "part_of", true);
            cell = await gs.decorateByRelation(cell, "capable_of");
            cell = await gs.decorateByDirectRelation(cell, "has_plasma_membrane_part");

            ss.save(cell);
            console.log(cell.uri);
        }
        catch (e) {
            return cb('Error occurred while processing ' + cell.uri);
        }

    }
}


run();
