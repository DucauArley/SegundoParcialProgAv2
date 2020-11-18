const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const DatosConexion = sequelize.define('datosConexion',
{
    ip:
    {
        type: DataTypes.STRING
    },
    ruta:
    {
        type: DataTypes.STRING
    },
    metodo:
    {
        type: DataTypes.STRING
    },
    usuario:
    {
        type: DataTypes.INTEGER
    }
},
{
    timestamps: true
});


DatosConexion.sync({force: false});//Si esta en true te sobreescribe la tabla

module.exports = DatosConexion;
