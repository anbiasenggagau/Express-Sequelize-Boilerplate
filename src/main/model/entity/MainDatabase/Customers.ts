import { BelongsTo, Column, DataType, Model, Table } from "sequelize-typescript"
import Users from "./Users"

export interface CustomersAttributes {
    Id: string
    Name: string
    Address: string
    PhoneNumber: string
    UserId: string
    CreatedAt: Date
    CreatedBy: string
    UpdatedAt: Date
    UpdatedBy: string
}

type CustomersAutoGeneratedAttributes = "Id" | "CreatedAt" | "UpdatedAt"
export type CustomersCreationAttributes = Omit<CustomersAttributes, CustomersAutoGeneratedAttributes>

@Table({
    freezeTableName: true,
    tableName: "Customers",
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
    paranoid: false,
    schema: "public"
})
class Customers extends Model<CustomersAttributes | CustomersCreationAttributes> implements CustomersAttributes {
    @Column({
        allowNull: false,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true
    })
    Id!: string

    @Column({
        allowNull: false,
        type: DataType.STRING(255)
    })
    Name!: string

    @Column({
        allowNull: false,
        type: DataType.STRING(255)
    })
    Address!: string

    @Column({
        allowNull: false,
        type: DataType.STRING(20)
    })
    PhoneNumber!: string

    @Column({
        allowNull: false,
        type: DataType.UUID,
        unique: true
    })
    UserId!: string

    @Column({
        allowNull: false,
        type: DataType.UUID,
    })
    CreatedBy!: string

    @Column({
        allowNull: false,
        type: DataType.DATE
    })
    CreatedAt!: Date

    @Column({
        allowNull: false,
        type: DataType.UUID,
    })
    UpdatedBy!: string

    @Column({
        allowNull: false,
        type: DataType.DATE
    })
    UpdatedAt!: Date

    @BelongsTo(() => Users, { foreignKey: "UserId", targetKey: "Id", onDelete: "CASCADE" })
    User!: Users
}

export default Customers