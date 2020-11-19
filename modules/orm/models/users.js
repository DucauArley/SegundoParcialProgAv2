const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { validate } = require('../db');

const Users = sequelize.define('usuarios',
{
    email:{
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        validate:
        {
            min: 1,
            max: 1000
        }
    },
    nombre:{
        type: DataTypes.STRING,
        unique: true,
    },
    clave:{
        type: DataTypes.STRING
    },
    tipo:{
        type: DataTypes.STRING,
        isOK(value)
        {
            if(value != "alumno" && value != "admin" && value != "profesor")
            {
                throw new Error("Solamente valores validos");
            }
        }
    }
},
{
});

Users.sync({force: false});//Si esta en true te sobreescribe la tabla

module.exports = Users;