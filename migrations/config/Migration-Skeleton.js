'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    await queryInterface.sequelize.query(`
      --WRITE YOUR MIGRATION QUERY HERE--
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
      --WRITE YOUR MIGRATION QUERY HERE--
        `, { transaction })
      .catch(error => {
        console.log(error)
        throw new Error(error)
      })
    await transaction.commit()
  }
};
