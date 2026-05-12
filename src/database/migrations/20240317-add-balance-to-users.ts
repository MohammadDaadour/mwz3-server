import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.addColumn('users', 'balance', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeColumn('users', 'balance');
} 