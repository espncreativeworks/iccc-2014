var keystone = require('keystone')
  , Video = keystone.list('Video').model;

function listVideos(req, res){
  var doc = {}
    , q;

  if (req.query.featured && parseInt(req.query.featured, 10) == 1){
    doc.isFeatured = true;
  }

  if (req.query.active && parseInt(req.query.active, 10) == 1){
    doc.isActive = true;
  }

  q = Video.find(doc).select('-__v');

  q.exec().then(function(videos){
    res.json(200, videos);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showVideo(req, res){
  var key = req.params.id
    , doc = { $or: [ { youtubeId: key } ] }
    , q;

  if (key.match(/^[0-9a-fA-F]{24}$/)) {
    doc.$or.push({ _id: key });
  }
  q = Video.findOne(doc).select('-__v');

  q.exec().then(function (video){
    res.json(200, video);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listVideos,
  show: showVideo
};
