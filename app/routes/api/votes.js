var keystone = require('keystone')
  , ObjectId = keystone.mongoose.Types.ObjectId
  , Ballot = keystone.list('Ballot').model
  , Coach = keystone.list('Coach').model
  , Vote = keystone.list('Vote').model
  , School = keystone.list('School').model
  , Charity = keystone.list('Charity').model
  , IpAddress = keystone.list('IpAddress').model
  , UserAgent = keystone.list('UserAgent').model
  , OperatingSystem = keystone.list('OperatingSystem').model
  , Device = keystone.list('Device').model
  , Q = require('q')
  , request = require('request')
  , useragent = require('useragent')
  , _ = require('underscore');

useragent(true);

function listVotes(req, res){
  var doc = {}, q, refs, _selects;

  if ('ballotId' in req.query){
    doc.ballot = ObjectId(req.query.ballotId);
  }

  if ('medium' in req.query){
    doc.medium = parseInt(req.query.medium, 10);
  }

  q = Vote.find(doc).select('-__v');

  if ('populate' in req.query && req.query.populate.trim().split(',').length > 0){
    refs = req.query.populate.trim().split(',');
    _selects = {
      'coach': '-__v',
      'ballot': '-__v',
      'ipAddress': '-__v',
      'userAgent': '-__v',
      'os': '-__v',
      'device': '-__v'
    };
    refs.forEach(function(ref){
      q.populate({
        path: ref,
        select: _selects[ref]
      });
    });
  }

  q.exec().then(function(votes){
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
          path: 'coach.' + _path,
          model: models[_path],
          select: selects[_path]
        });
      });

      return Coach.populate(votes, opts);
    } else {
      return votes;
    }
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (votes){
    res.json(200, votes);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).end();
}

function createVote(req, res){
  var doc = {
      ballot: ObjectId(req.param('ballotId')),
      coach: ObjectId(req.param('coachId')),
      medium: req.param('medium'),
      ipAddress: req.param('ipAddress') || req.ip || req.ips[0] || null,
      userAgent: req.param('userAgent') || req.get('User-Agent') || null,
      operatingSystem: null,
      device: null
    };
  //console.log(doc);

  var _medium = parseInt(doc.medium, 10)
    , validMediumCodes = [1, 2, 3, 4]
    , isValidMedium = true
    , err;

  // check for existence of submitted medium in valid mediums
  if (_.indexOf(validMediumCodes, _medium) === -1){
    isValidMedium = false;
  }

  // return early is medium is not valid
  if (!isValidMedium){
    err = new Error('Invalid Medium');
    err.message = 'Medium ' + doc.medium + ' is not a valid medium code.';
    throw err;
  }

  Ballot.findOne({ _id: doc.ballot }).exec().then(function (ballot){
    //console.log(ballot);
    var isValidCoach = false;

    // check for existence of submitted coachId in ballot.coaches
    //console.log(ballot.coaches[0].toString());
    ballot.coaches.forEach(function (_coachId){
      if (_coachId.toString() === doc.coach.toString()){
        isValidCoach = true;
      }
    });

    // return early if ballot is inactive
    if (!ballot.isActive){
      err = new Error('Invalid Ballot');
      err.message = 'Ballot ' + doc.ballot + ' is inactive';
      throw err;
    }

    // return early is coach is not part of the ballot
    if (!isValidCoach){
      err = new Error('Invalid Coach');
      err.message = 'Coach ' + doc.coach + ' is not a member of this ballot.';
      throw err;
    }

    return Coach.findOne({ _id: doc.coach }).exec();
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (coach){
    var err;
    //console.log(coach);

    // return early if is not active
    if (!coach.isActive) {
      err = new Error('Invalid Coach');
      err.message = 'Coach ' + doc.coach + ' is inactive.';
      throw err;
    }
    return IpAddress.findOne({ address: doc.ipAddress }).exec();
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (ipAddress){
    var deferred = Q.defer();
    if (!ipAddress){
      getIpGeolocation(doc.ipAddress).then(function (_ip){
        var _doc = {
          address: _ip.ip,
          location: {
            suburb: _ip.city,
            state: _ip.region_code,
            postcode: _ip.zipcode,
            country: _ip.country_name,
            geo: [ _ip.longitude, _ip.latitude ]
          }
        };
        return IpAddress.create(_doc);
      }, function (err){
        console.error('Error from getIpGeolocation( ' + doc.ipAddress + ' )');
        deferred.reject(err);
      }).then(function (ipAddress){
        doc.ipAddress = ipAddress._id;
        deferred.resolve(doc);
      }, function (err){
        console.error('Error from IpAddress.create() ...');
        deferred.reject(err);
      });
    } else {
      doc.ipAddress = ipAddress._id;
      deferred.resolve(doc);
    }
    return deferred.promise;
  }, function (err){
    console.error('Error from IpAddress.findOne() ...');
    res.json(500, { name: err.name, message: err.message });
  }).then(function (doc){
    var deferred = Q.defer()
      , _uaDeferred = Q.defer()
      , _osDeferred = Q.defer()
      , _deviceDeferred = Q.defer()
      , agent = useragent.lookup(doc.userAgent)
      , _userAgent = _.extend({}, agent)
      , _operatingSystem = _.extend({}, agent.os)
      , _device = _.extend({}, agent.device);

    UserAgent.findOne(_userAgent).exec().then(function (ua){
      if (!ua){
        UserAgent.create(_userAgent).then(function (userAgent){
          doc.userAgent = userAgent._id;
          _uaDeferred.resolve(doc);
        }, function (err){
          console.log('Error creating userAgent...');
          _uaDeferred.reject(err);
        });
      } else {
        doc.userAgent = ua._id;
        _uaDeferred.resolve(doc);
      }
      return _uaDeferred.promise;
    }, function (err){
      console.log('Error finding userAgent...');
      deferred.reject(err);
    }).then(function(doc){
      OperatingSystem.findOne(_operatingSystem).exec().then(function (os){
        if (!os){
          OperatingSystem.create(_operatingSystem).then(function (operatingSystem){
            doc.operatingSystem = operatingSystem._id;
            _osDeferred.resolve(doc);
          }, function (err){
            console.log('Error creating operating system...');
            console.error(err);
            _osDeferred.reject(err);
          });
        } else {
          doc.operatingSystem = os._id;
          _osDeferred.resolve(doc);
        }
      }, function (err){
        console.log('Error finding operating system...');
        console.error(err);
        _osDeferred.reject(err);
      });
      return _osDeferred.promise;
    }, function (err){
      console.log('Error creating userAgent');
      console.error(err);
      deferred.reject(err);
    }).then(function (doc){
      Device.findOne(_device).exec().then(function (__device){
        if (!__device){
          Device.create(_device).then(function (device){
            doc.device = device._id;
            _deviceDeferred.resolve(doc);
          }, function (err){
            console.log('Error creating device...');
            console.error(err);
            _deviceDeferred.reject(err);
          });
        } else {
          doc.device = __device._id;
          _deviceDeferred.resolve(doc);
        }
      }, function (err){
        console.log('Error finding device...');
        console.error(err);
        _deviceDeferred.reject(err);
      });
      return _deviceDeferred.promise;
    }, function (err){
      console.log('Error creating operating system...');
      console.error(err);
      deferred.reject(err);
    }).then(function (doc){
      deferred.resolve(doc);
    }, function (err){
      console.log('Error creating device...');
      console.error(err);
      deferred.reject(err);
    });

    return deferred.promise;

  }, function (err){
    console.log('Error finding or creating ipAddress...');
    console.error(err);
  }).then(function (doc){
    return Vote.create(doc);
  }, function (err){
    console.log('Error finding or creating userAgent, operatingSystem or device...');
    console.error(err);
    res.json(500, { name: err.name, message: err.message });
  }).then(function (vote){
    //console.log(vote);
    var q = Vote.findOne(vote);
    q.populate('coach', '_id name slug totalVotes');
    q.populate('ballot', '_id totalVotes');
    return q.exec();
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (vote){
    //console.log(vote);
    res.json(201, vote);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showVote(req, res){
  var q = Vote.findOne({ _id: req.params.id });

  q.populate('coach', 'name _id espnId');
  q.populate('ballot', '_id totalVotes');
  q.populate('ipAddress', 'address location');
  q.populate('userAgent', 'family major minor patch');
  q.populate('operatingSystem', 'family major minor patch');
  q.populate('device', 'family major minor patch');

  q.exec().then(function (vote){
    if (vote){
      res.json(200, vote);
    } else {
      res.json(404, { name: 'Not Found', message: 'No vote found for :' + req.params.id });
    }
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function getIpGeolocation(ip){
  var deferred = Q.defer()
    , baseUrl = 'http://www.telize.com/geoip/'
    , _url = baseUrl + ip
    , opts = {
      method: 'GET',
      url: _url
    };

  request(opts, function (err, response, body){
    if (err){
      return deferred.reject(err);
    }
    return deferred.resolve(JSON.parse(body));
  });

  return deferred.promise;
}

exports = module.exports = {
  list: listVotes,
  create: createVote,
  show: showVote
};
