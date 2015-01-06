var BitlyApi = require('node-bitlyapi');
var Bitly = new BitlyApi({
  'client_id': process.env.BITLY_CLIENT_ID,
  'client_secret': process.env.BITLY_CLIENT_SECRET
});
Bitly.setAccessToken(process.env.BITLY_ACCESS_TOKEN);

function shortenUrl(req, res){
  var longUrl = req.param('longUrl');

  Bitly.shortenLink(longUrl, function(err, results) {
    if (err){
      console.error(err);
      return res.json(500, err);
    }
    results = JSON.parse(results);
    var code = results.status_code;
    if (code >= 200 && code < 300){
      res.json(results.status_code, results.data);
    } else {
      res.json(results.status_code, { message: results.status_txt });
    }
  });
}

exports = module.exports = {
  shorten: shortenUrl
};
