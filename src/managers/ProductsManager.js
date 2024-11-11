import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import { convertToBoolean } from "../utils/converter.js";
import ErrorManager from "./ErrorManager.js";

export default class ProductManager{
    #jsonFilename;
    #products;

    constructor() {
        this.#jsonFilename = "products.json";
    }

    async #findOneById(id) {
        this.#products = await this.getAll();
        const productFound = this.#products.find((item) => item.id === Number(id));

        if (!productFound) {
            throw new ErrorManager("ID no encontrado", 404);
        }

        return productFound;
    }

    async getAll() {
        try {
            this.#products = await readJsonFile(paths.files, this.#jsonFilename);
            return this.#products;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    async getOneById(id) {
        try {
            const productFound = await this.#findOneById(id);
            return productFound;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    async insertOne(data) {
        try {
            const { title, description, code, price, status, stock, category } = data;

            if (!title || !description || !code || !price || !status || !stock || !category ) {
                throw new ErrorManager("Faltan datos obligatorios", 400);
            }

            const product = {
                id: generateId(await this.getAll()),
                title,
                description,
                code,
                price,
                status: convertToBoolean(status),
                stock: Number(stock),
                category,
                
            };

            this.#products.push(product);
            await writeJsonFile(paths.files, this.#jsonFilename, this.#products);
            return product;

        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    async updateOneById(id, data) {
        try {
            const { title, description, code, price, status, stock, category } = data;
            const productFound = await this.#findOneById(id);

            const product = {
                id: productFound.id,
                title: title || productFound.title,
                description: description || productFound.description,
                code: code ? Number(code) : productFound.code,
                price: price ? Number(price) : productFound.price,
                status: status ? convertToBoolean(status) : productFound.status,
                stock: stock ? Number(stock) : productFound.stock,
                category: category || productFound.category,
            };

            const index = this.#products.findIndex((item) => item.id === Number(id));
            this.#products[index] = product;
            await writeJsonFile(paths.files, this.#jsonFilename, this.#products);
            return product;

        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    async deleteOneById (id) {
        try {
            const productFound = await this.#findOneById(id);

            const index = this.#products.findIndex((item) => item.id === Number(id));
            this.#products.splice(index, 1);
            await writeJsonFile(paths.files, this.#jsonFilename, this.#products);
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }
};
