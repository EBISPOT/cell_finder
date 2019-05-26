
class Cell {

    constructor() {
        this._uri = null;
        this._label = null;
        this._synonyms = [];
        this._definition = null;
        this._source = null;
        this._related = new Map();

    }

    get related() {
        return this._related;
    }

    set related(value) {
        this._related = value;
    }

    get uri() {
        return this._uri;
    }

    set uri(value) {
        this._uri = value;
    }

    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
    }

    get synonyms() {
        return this._synonyms;
    }

    set synonyms(value) {
        this._synonyms = value;
    }

    get definition() {
        return this._definition;
    }

    set definition(value) {
        this._definition = value;
    }

    get source() {
        return this._source;
    }

    set source(value) {
        this._source = value;
    }

    get toDoc() {
        let obj = {
                uri: this._uri,
                label: this._label,
                synonyms: this._synonyms,
                definition: this._definition,
                source: this._source
            };
        for (const [key, value] of this._related.entries()) {
            obj[key] = value;
        }
        return obj;
    }
}

module.exports = {Cell};
