var keystone = require('keystone')
  , _ = require('underscore')
  , Coach = keystone.list('Coach').model
  , util = require('util');

function listCoaches(req, res){
  var doc = {}, q, refs, _selects;

  if (parseInt(req.query.active || 0, 10) === 1){
    doc.isActive = true;
  }

  q = Coach.find(doc).select('-__v');

  if (req.query.populate && req.query.populate.trim().length > 0){
    refs = req.query.populate.trim().split(',');
    _selects = {
      'school': '-__v -_id -totalVotes',
      'charity': '-__v -_id -totalVotes'
    };
    refs.forEach(function(ref){
      q.populate({
        path: ref,
        select: _selects[ref]
      });
    });
  }

  q.exec().then(function(coaches){
    res.json(coaches);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showCoach(req, res){
  var doc = { _id: req.params.id }, q, refs, _selects;

  q = Coach.findOne(doc).select('-__v');

  if (req.query.populate && req.query.populate.trim().length > 0){
    refs = req.query.populate.trim().split(',');
    _selects = {
      'school': '-__v -_id -totalVotes',
      'charity': '-__v -_id -totalVotes'
    };
    refs.forEach(function(ref){
      q.populate({
        path: ref,
        select: _selects[ref]
      });
    });
  }

  q.exec().then(function (coach){
    if (coach){ 
      res.json(200, coach);
    } else {
      res.json(404, { name: 'Not Found', message: 'No Coach found for :' + req.params.id });
    }
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listCoaches,
  show: showCoach
};
