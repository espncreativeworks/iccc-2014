var keystone = require('keystone')
  , IpAddress = keystone.list('IpAddress').model;

function listIpAddresss(req, res){
  var doc = {}
    , q;

  q = IpAddress.find(doc).select('-__v');

  q.exec().then(function(ipAddresses){
    res.json(200, ipAddresses);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showIpAddress(req, res){
  var key = req.params.id
    , doc = { $or: [ { slug: key } ] }
    , q;

  if (key.match(/^[0-9a-fA-F]{24}$/)) {
    doc.$or.push({ _id: key });
  }

  q = IpAddress.findOne(doc).select('-__v');

  q.exec().then(function (ipAddress){
    res.json(200, ipAddress);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listIpAddresss,
  show: showIpAddress
};
