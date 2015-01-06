var keystone = require('keystone')
  , Device = keystone.list('Device').model;

function listDevices(req, res){
  var doc = {}
    , q;

  q = Device.find(doc).select('-__v');

  q.exec().then(function(devices){
    res.json(200, devices);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showDevice(req, res){
  var key = req.params.id
    , doc = { $or: [ { slug: key } ] }
    , q;

  if (key.match(/^[0-9a-fA-F]{24}$/)) {
    doc.$or.push({ _id: key });
  }

  q = Device.findOne(doc).select('-__v');

  q.exec().then(function (device){
    res.json(200, device);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listDevices,
  show: showDevice
};
