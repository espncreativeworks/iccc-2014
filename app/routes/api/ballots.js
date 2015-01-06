var keystone = require('keystone')
  , Ballot = keystone.list('Ballot').model
  , Coach = keystone.list('Coach').model
  , School = keystone.list('School').model
  , Charity = keystone.list('Charity').model;

function listBallots(req, res){
  var doc = {}, q, refs, _selects, multi = true;

  if (parseInt(req.query.active || 0, 10) === 1){
    doc.isActive = true;
    multi = false;
  }

  if (multi){
    q = Ballot.find(doc).select('-__v');
  } else {
    q = Ballot.findOne(doc).select('-__v');
  }

  if ('populate' in req.query && req.query.populate.trim().split(',').length > 0){
    refs = req.query.populate.trim().split(',');
    _selects = {
      'coaches': '-__v '
    };
    refs.forEach(function(ref){
      q.populate({
        path: ref,
        select: _selects[ref]
      });
    });
  }

  q.exec().then(function(ballots){
    if (refs && refs.length){
      var opts = []
        , paths = ['school', 'charity']
        , selects = {
          school: '-_id -__v -totalVotes',
          charity: '-_id -__v -totalVotes'
        }
        , models = {
          school: School,
          charity: Charity
        };

      paths.forEach(function (_path){
        opts.push({
          path: 'coaches.' + _path,
          model: models[_path],
          select: selects[_path]
        });
      });

      return Coach.populate(ballots, opts);
    } else {
      return ballots;
    }
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (ballots){
    res.json(200, ballots);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).end();
}

function showBallot(req, res){
  var doc = { _id: req.params.id }
    , q
    , refs
    , _selects;

  q = Ballot.findOne(doc).select('-__v');

  if ('populate' in req.query && req.query.populate.trim().length > 0){
    refs = req.query.populate.trim().split(',');
    _selects = {
      'coaches': '-__v '
    };
    refs.forEach(function(ref){
      q.populate({
        path: ref,
        select: _selects[ref]
      });
    });
  }

  q.exec().then(function (ballot){
    if (refs && refs.length){
      var opts = []
        , paths = ['school', 'charity']
        , selects = {
          school: 'slug name abbreviation',
          charity: 'slug name abbreviation primaryColor espnId'
        }
        , models = {
          school: School,
          charity: Charity
        };
      paths.forEach(function (_path){
        opts.push({
          path: 'coaches.' + _path,
          model: models[_path],
          select: selects[_path]
        });
      });
      return Coach.populate(ballot, opts);
    } else {
      return ballot;
    }
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (ballot){
    res.json(200, ballot);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listBallots,
  show: showBallot
};
