import Products, { ProductsAttributes, ProductsCreationAttributes } from "../entity/Products";
import BaseRepository from "./.BaseRepository";

class ProductsRepo extends BaseRepository<Products, ProductsAttributes, ProductsCreationAttributes> {

}

export default new ProductsRepo(Products as any)