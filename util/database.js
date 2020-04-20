const Sequelize = require('sequelize').Sequelize;

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER , process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});


//sequelize.authenticate().then(() => console.log('Connected')).catch(e => console.log(e));

module.exports = sequelize;
