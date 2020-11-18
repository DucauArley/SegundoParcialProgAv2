const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { validate } = require('../db');

const Users = sequelize.define('usuarios',
{
    legajo:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        validate:
        {
            min: 1,
            max: 1000
        }
    },
    clave:{
        type: DataTypes.STRING
    },
    tipo:{
        type: DataTypes.STRING,
        isOK(value)
        {
            if(value != "user" && value != "admin")
            {
                throw new Error("Solamente valores validos");
            }
        }
    }
},
{
    timestamps: true
});

Users.sync({force: false});//Si esta en true te sobreescribe la tabla

module.exports = Users;