import { Column, DataType, HasOne, Model, Table } from "sequelize-typescript"
import Stores from "./Stores"

export interface CustomersAttributes {
    Id?: string
    Name?: string
    Email?: string
    Address?: string
    PhoneNumber?: string
    CreatedAt?: Date
    CreatedBy?: string
    UpdatedAt?: Date
    UpdatedBy?: string
}

type CustomersOptionalAttributes = "Id" | "CreatedAt" | "UpdatedAt"
export type CustomersCreationAttributes = Omit<CustomersAttributes, CustomersOptionalAttributes>

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
    Id?: string

    @Column({
        allowNull: false,
        type: DataType.STRING(255)
    })
    Name?: string

    @Column({
        allowNull: false,
        type: DataType.STRING(255),
        unique: true
    })
    Email?: string

    @Column({
        allowNull: false,
        type: DataType.STRING(255)
    })
    Address?: string

    @Column({
        allowNull: false,
        type: DataType.STRING(20)
    })
    PhoneNumber?: string

    @Column({
        allowNull: false,
        type: DataType.UUID,
    })
    CreatedBy?: string

    @Column({
        allowNull: false,
        type: DataType.UUID,
    })
    UpdatedBy?: string

    @HasOne(() => Stores, "StoresId")
    Store?: Stores
}

export default Customers