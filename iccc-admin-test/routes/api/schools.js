var keystone = require('keystone')
  , School = keystone.list('School').model;

function listSchools(req, res){
  var doc = {}
    , q;

  q = School.find(doc).select('-__v');

  q.exec().then(function(schools){
    res.json(200, schools);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showSchool(req, res){
  var doc = { _id: req.params.id }
    , q;

  q = School.findOne(doc).select('-__v');

  q.exec().then(function (school){
    res.json(200, school);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listSchools,
  show: showSchool
};
