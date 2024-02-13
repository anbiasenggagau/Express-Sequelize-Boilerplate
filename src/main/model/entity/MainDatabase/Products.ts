import { BelongsTo, Column, DataType, Model, Table } from "sequelize-typescript"
import Stores from "./Stores"

export interface ProductsAttributes {
    Id?: string
    Name?: string
    Price?: number
    Currency?: string
    StoreId?: string
    CreatedAt?: Date
    CreatedBy?: string
    UpdatedAt?: Date
    UpdatedBy?: string
}

type ProductsOptionalAttributes = "Id" | "CreatedAt" | "UpdatedAt"
export type ProductsCreationAttributes = Omit<ProductsAttributes, ProductsOptionalAttributes>

@Table({
    freezeTableName: true,
    tableName: "Products",
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
    paranoid: false,
    schema: "public"
})
class Products extends Model<ProductsAttributes | ProductsCreationAttributes> implements ProductsAttributes {
    @Column({
        allowNull: false,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true
    })
    Id?: string

    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    Name?: string

    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    Price?: number

    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    Currency?: string

    @Column({
        allowNull: false,
        type: DataType.UUID,
        references: {
            model: Stores,
            key: "Id"
        }
    })
    StoreId?: string

    @Column({
        allowNull: false,
        type: DataType.UUID,
    })
    CreatedBy?: string

    @Column({
        allowNull: false,
        type: DataType.DATE
    })
    CreatedAt?: Date

    @Column({
        allowNull: false,
        type: DataType.UUID,
    })
    UpdatedBy?: string

    @Column({
        allowNull: false,
        type: DataType.DATE
    })
    UpdatedAt?: Date

    @BelongsTo(() => Stores, "StoreId")
    Store?: Stores
}

export default Products