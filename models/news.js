const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: 'database.sqlite',
});

const News = sequelize.define(
	'News',
	{
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	},
	{}
);

module.exports = News;
