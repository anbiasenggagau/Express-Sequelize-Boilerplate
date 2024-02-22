import { Column, DataType, HasOne, Model, Table } from "sequelize-typescript"
import Customers from "./Customers"
import Stores from "./Stores"

export interface UsersAttributes {
    Id: string
    Email: string
    Username: string
    Password: string
    CreatedAt: Date
}

type UsersAutoGeneratedAttributes = "Id" | "CreatedAt" | "UpdatedAt"
export type UsersCreationAttributes = Omit<UsersAttributes, UsersAutoGeneratedAttributes>

@Table({
    freezeTableName: true,
    tableName: "Users",
    updatedAt: false,
    createdAt: "CreatedAt",
    paranoid: false,
    schema: "public"
})
class Users extends Model<UsersAttributes | UsersCreationAttributes> implements UsersAttributes {

    @Column({
        allowNull: false,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    Id!: string

    @Column({
        allowNull: false,
        type: DataType.STRING,
        unique: true
    })
    Email!: string

    @Column({
        allowNull: false,
        type: DataType.STRING,
        unique: true
    })
    Username!: string

    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    Password!: string

    @Column({
        allowNull: false,
        type: DataType.DATE
    })
    CreatedAt!: Date

    @HasOne(() => Customers, { foreignKey: "UserId", sourceKey: "Id", onDelete: "CASCADE" })
    Customer!: Customers

    @HasOne(() => Stores, { foreignKey: "UserId", sourceKey: "Id", onDelete: "CASCADE" })
    Store!: Stores
}

export default Users