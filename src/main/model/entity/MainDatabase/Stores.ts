import { BelongsTo, Column, DataType, HasOne, Model, Table } from "sequelize-typescript"
import Customers from "./Customers"
import Products from "./Products"

export interface StoresAttributes {
    Id?: string
    Name?: string
    CustomersId?: string
    CreatedAt?: Date
    CreatedBy?: string
    UpdatedAt?: Date
    UpdatedBy?: string
}

type StoresOptionalAttributes = "Id" | "CreatedAt" | "UpdatedAt"
export type StoresCreationAttributes = Omit<StoresAttributes, StoresOptionalAttributes>

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
    Id?: string

    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    Name?: string

    @Column({
        allowNull: false,
        type: DataType.UUID,
        unique: true,
        references: {
            model: Customers,
            key: "Id",
        },
    })
    CustomersId?: string

    @Column({
        allowNull: false,
        type: DataType.DATE
    })
    CreatedAt?: Date

    @Column({
        allowNull: false,
        type: DataType.UUID
    })
    CreatedBy?: string

    @Column({
        allowNull: false,
        type: DataType.DATE
    })
    UpdatedAt?: Date

    @Column({
        allowNull: false,
        type: DataType.UUID
    })
    UpdatedBy?: string

    @BelongsTo(() => Customers, "CustomersId")
    Customer?: Customers

    @HasOne(() => Products, "StoresId")
    Store?: Stores
}

export default Stores