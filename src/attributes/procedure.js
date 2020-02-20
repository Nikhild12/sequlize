const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const _getProceduresSearchQuery = (value, ...args) => {
  const searchField = args.map(a => {
    return {
      [a]: {
        [Op.like]: `%${value}%`
      }
    };
  });
  return {
    where: {
      [Op.or]: searchField
    }
  };
};

const _getSearchQueryFromSearchKey = (searchkey, searchvalue) => {
  switch (searchkey.toLowerCase()) {
    case 'threeletters':
      return _getProceduresSearchQuery(searchvalue, "name", "code");
    default:
      return {};
  }
};

module.exports = {
  getProceduresSearchQuery: _getProceduresSearchQuery,
  getSearchQueryFromSearchKey: _getSearchQueryFromSearchKey
};
