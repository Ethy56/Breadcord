module.exports = class BreadError extends Error {
    constructor(error) {
        super(error);
        this.name = "BreadCord Error";
    }
}