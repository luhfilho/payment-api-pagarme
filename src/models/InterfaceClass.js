class InterfaceClass {
    constructor(collection) {
        this._collection = null;
    }

    dump() {
        throw 'You must define count function at your model class';
    }

    /**
     * 
     * @param {Object} where 
     */
    count(where = {}) {
        throw 'You must define count function at your model class';
    }

    /**
     * 
     * @param {Object} where 
     */
    findOne(where = {}) {
        throw 'You must define findOne function at your model class';
    }

    /**
     * 
     * @param {Object} where 
     */
    find(where = {}) {
        throw 'You must define find function at your model class';

    }

    save() {
        throw 'You must define update function at your model class';

    }

    update() {
        throw 'You must define update function at your model class';

    }

    remove() {
        throw 'You must define remove function at your model class';

    }

    insert() {
        throw 'You must define insert function at your model class';

    }

    save() {
        throw 'You must define save function at your model class';

    }

    upsert() {
        throw 'You must define upsert function at your model class';
    }
}

module.exports = InterfaceClass;