var keystone = require('keystone'),
_ = require('underscore'),
  Types = keystone.Field.Types;

/**
 * Charity Model
 * ==========
 */

var Charity = new keystone.List('Charity', {
  autokey: { path: 'slug', from: 'name', unique: true },
  defaultSort: 'name',
  track: true
});

Charity.add({
  name: { type: Types.Text, initial: true, required: true, index: true },
  abbreviation: { type: Types.Text, initial: true, required: true, index: true },
  twitterName: { type: Types.Text, index: true, note: 'exclude \'@\' symbol' }
}, 'Meta', {
  totalVotes: { type: Types.Number, default: 0, noedit: true },
  url: { type: Types.Url, note: 'e.g., Wikipedia URL, if available' },
  description: { type: Types.Text, initial: true, required: true, index: true }
});

/**
 * Relationships
 */
Charity.relationship({ path: 'coaches', ref: 'Coach', refPath: 'charity' });

Charity.schema.set('toJSON', {
  transform: function(doc, rtn, options) {
    var _doc = _.pick(doc, '_id', 'name', 'abbreviation', 'url', 'description', 'slug', 'twitterName');
    return _doc;
  }
});

/**
 * Registration
 */
Charity.defaultColumns = 'name, abbreviation';
Charity.register();
