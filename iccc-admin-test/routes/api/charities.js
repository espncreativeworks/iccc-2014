var keystone = require('keystone')
  , Charity = keystone.list('Charity').model;

function listCharities(req, res){
  var doc = {}
    , q;

  q = Charity.find(doc).select('-__v');

  q.exec().then(function(schools){
    res.json(200, schools);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showCharity(req, res){
  var doc = { _id: req.params.id }
    , q;

  q = Charity.findOne(doc).select('-__v');

  q.exec().then(function (school){
    res.json(200, school);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listCharities,
  show: showCharity
};
