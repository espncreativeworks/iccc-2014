var keystone = require('keystone'),
_ = require('underscore'),
  Types = keystone.Field.Types;

/**
 * School Model
 * ==========
 */

var School = new keystone.List('School', {
  autokey: { path: 'slug', from: 'name', unique: true },
  defaultSort: 'name',
  track: true
});

School.add({
  espnId: { type: Types.Key, initial: true, required: true, index: true, label: 'ESPN ID' },
  name: { type: Types.Text, initial: true, required: true, index: true },
  abbreviation: { type: Types.Text, initial: true, required: true, index: true },
  primaryColor: { type: Types.Color, initial: true, required: true },
  secondaryColor: { type: Types.Color },
  twitterName: { type: Types.Text, index: true, note: 'exclude \'@\' symbol' }
}, 'Meta', {
  totalVotes: { type: Types.Number, default: 0, noedit: true },
  url: { type: Types.Url, note: 'e.g., Wikipedia URL, if available' }
});

/**
 * Relationships
 */
School.relationship({ path: 'coaches', ref: 'Coach', refPath: 'school' });

School.schema.set('toJSON', {
  transform: function(doc, rtn, options) {
    var _doc = _.pick(doc, '_id', 'name', 'abbreviation', 'url', 'primaryColor', 'slug', 'twitterName');
    return _doc;
  }
});

/**
 * Registration
 */
School.defaultColumns = 'name, abbreviation';
School.register();
