const BreadError = require("./BreadError.js");

module.exports = class Collection extends Map {
    constructor(items = []) {
        super();
        this.items = [];
        if (items.length !== 0) {
            items.forEach(item=>{
                this.addItem(item);
            });
        }
    }
    setItems(items = []) {
        if (items.length !== 0) {
            this.clear();
            items.forEach(item=>{
                this.addItem(item);
            });
        }
    }
    addItem(item = {name: null, callback: null}) {
        if (!item.name) {
            throw (new BreadError("No name provided for adding Item to Collection `" + this.name + "`")).error;
        }
        if (!item.callback) {
            throw (new BreadError("No callback provided for adding Item to Collection `" + this.name + "`")).error;
        }
        this.set(item.name, item);
    }
    removeItem(name) {
        if (!name) {
            throw (new BreadError("No name provided for removing Item from Collection `" + this.name + "`")).error;
        }
        if (this.get(name)) {
            this.delete(name);
        }
    }
    array() {
        return this.items;
    }
};