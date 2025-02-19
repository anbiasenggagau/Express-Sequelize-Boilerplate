import Product, { ProductAttributes, ProductCreationAttributes } from "../entity/Product";
import BaseRepository from "./.BaseRepository";

class ProductRepo extends BaseRepository<Product, ProductAttributes, ProductCreationAttributes> {

}

export default new ProductRepo(Product)