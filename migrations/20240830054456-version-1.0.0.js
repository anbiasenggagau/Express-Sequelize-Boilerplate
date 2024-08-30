'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS "public"."Users" (
          "Id" UUID NOT NULL DEFAULT uuid_generate_v4(),
          "Email" VARCHAR(255) NOT NULL UNIQUE,
          "Username" VARCHAR(255) NOT NULL UNIQUE,
          "Password" VARCHAR(255) NOT NULL,
          "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          PRIMARY KEY ("Id")
      );

      CREATE TABLE IF NOT EXISTS "public"."Customers" (
          "Id" UUID NOT NULL DEFAULT uuid_generate_v4(),
          "Name" VARCHAR(255) NOT NULL,
          "Address" VARCHAR(255) NOT NULL,
          "PhoneNumber" VARCHAR(20) NOT NULL,
          "UserId" UUID NOT NULL UNIQUE REFERENCES "public"."Users" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
          "CreatedBy" UUID NOT NULL,
          "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "UpdatedBy" UUID NOT NULL,
          "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          PRIMARY KEY ("Id")
      );

      CREATE TABLE IF NOT EXISTS "public"."Stores" (
          "Id" UUID NOT NULL DEFAULT uuid_generate_v4(),
          "Name" VARCHAR(255) NOT NULL,
          "UserId" UUID NOT NULL UNIQUE REFERENCES "public"."Users" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
          "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          PRIMARY KEY ("Id")
      );

      CREATE TABLE IF NOT EXISTS "public"."Products" (
          "Id" UUID NOT NULL DEFAULT uuid_generate_v4(),
          "Name" VARCHAR(255) NOT NULL,
          "Price" INTEGER NOT NULL,
          "Currency" VARCHAR(255) NOT NULL,
          "StoreId" UUID NOT NULL REFERENCES "public"."Stores" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
          "CreatedBy" UUID NOT NULL,
          "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "UpdatedBy" UUID NOT NULL,
          "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          PRIMARY KEY ("Id")
          );
    `, { transaction })
      .catch(error => {
        console.log(error)
        throw new Error(error)
      })
    await transaction.commit()
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS "public"."Customers";
      DROP TABLE IF EXISTS "public"."Products";
      DROP TABLE IF EXISTS "public"."Stores";
      DROP TABLE IF EXISTS "public"."Users";
        `, { transaction })
      .catch(error => {
        console.log(error)
        throw new Error(error)
      })
    await transaction.commit()
  }
};
