const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { validate } = require('../db');

const logsUsers = sequelize.define('logsUsuarios',
{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    legajo:{
        type: DataTypes.INTEGER,
        validate:
        {
            min: 1,
            max: 1000
        }
    }
},
{
    timestamps: true
});

logsUsers.sync({force: false});//Si esta en true te sobreescribe la tabla

module.exports = logsUsers;