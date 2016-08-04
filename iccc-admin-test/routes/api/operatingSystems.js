var keystone = require('keystone')
  , OperatingSystem = keystone.list('OperatingSystem').model;

function listOperatingSystems(req, res){
  var doc = {}
    , q;

  q = OperatingSystem.find(doc).select('-__v');

  q.exec().then(function(operatingSystems){
    res.json(200, operatingSystems);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showOperatingSystem(req, res){
  var key = req.params.id
    , doc = { $or: [ { slug: key } ] }
    , q;

  if (key.match(/^[0-9a-fA-F]{24}$/)) {
    doc.$or.push({ _id: key });
  }

  q = OperatingSystem.findOne(doc).select('-__v');

  q.exec().then(function (operatingSystem){
    res.json(200, operatingSystem);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listOperatingSystems,
  show: showOperatingSystem
};
