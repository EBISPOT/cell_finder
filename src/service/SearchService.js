import {EsClient} from "../ConnectionConfig";

class SearchService {

    constructor(index, document_type) {

        this.es = new EsClient();
        this.index = index || "cell_finder";
        this.document_type = document_type || "cell";

    }

    resetIndex() {
        console.log('deleting all...')
        this.es.get_session().delete({
            type: this.document_type
        }, function (error, response) {
            console.log(response);
        });
    }

    findOne(cell) {

    }

    findAll() {

    }

    save(cell) {
        console.log("saving to es...");

        return this.es.get_session().index({
            index: this.index,
            type: this.document_type,
            id: cell.uri,
            body: cell.toDoc

        })
    }

}

module.exports = {SearchService};