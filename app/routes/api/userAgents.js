var keystone = require('keystone')
  , UserAgent = keystone.list('UserAgent').model;

function listUserAgents(req, res){
  var doc = {}
    , q;

  q = UserAgent.find(doc).select('-__v');

  q.exec().then(function(userAgents){
    res.json(200, userAgents);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showUserAgent(req, res){
  var key = req.params.id
    , doc = { $or: [ { slug: key } ] }
    , q;

  if (key.match(/^[0-9a-fA-F]{24}$/)) {
    doc.$or.push({ _id: key });
  }

  q = UserAgent.findOne(doc).select('-__v');

  q.exec().then(function (userAgent){
    res.json(200, userAgent);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listUserAgents,
  show: showUserAgent
};
