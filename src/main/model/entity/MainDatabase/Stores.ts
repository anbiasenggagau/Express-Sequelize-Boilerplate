import { BelongsTo, Column, DataType, HasMany, Model, Table } from "sequelize-typescript"
import Products from "./Products"
import Users from "./Users"

export interface StoresAttributes {
    Id: string
    Name: string
    UserId: string
    CreatedAt: Date
    UpdatedAt: Date
}

type StoresAutoGeneratedAttributes = "Id" | "CreatedAt" | "UpdatedAt"
export type StoresCreationAttributes = Omit<StoresAttributes, StoresAutoGeneratedAttributes>

@Table({
    freezeTableName: true,
    tableName: "Stores",
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
    paranoid: false,
    schema: "public"
})
class Stores extends Model<StoresAttributes | StoresCreationAttributes> implements StoresAttributes {

    @Column({
        allowNull: false,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true
    })
    Id!: string

    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    Name!: string

    @Column({
        allowNull: false,
        type: DataType.UUID,
        unique: true,
    })
    UserId!: string

    @Column({
        allowNull: false,
        type: DataType.DATE
    })
    CreatedAt!: Date

    @Column({
        allowNull: false,
        type: DataType.DATE
    })
    UpdatedAt!: Date

    @BelongsTo(() => Users, { foreignKey: "UserId", targetKey: "Id", onDelete: "CASCADE" })
    User!: Users

    @HasMany(() => Products, { foreignKey: "StoreId", sourceKey: "Id", onDelete: "CASCADE" })
    Product!: Products[]
}

export default Stores