module.exports = (sequelize, DataTypes) => {
    const CensoredWord = sequelize.define('CensoredWord', {
      word: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    });
  
    return CensoredWord;
  };
  