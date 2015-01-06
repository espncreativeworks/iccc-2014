var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * UserAgent Model
 * ==========
 */

var UserAgent = new keystone.List('UserAgent', {
  autokey: { path: 'slug', from: 'source', unique: true },
  map: { name: 'source' },
  defaultSort: 'family',
  noedit: true,
  nocreate: true,
  nodelete: true,
  track: true
});

UserAgent.add({
  source: { type: Types.Text, initial: true, required: true, index: true, note: 'e.g., Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2159.4 Safari/537.36' },
  family: { type: Types.Text, index: true, note: 'e.g., Chrome' },
  major: { type: Types.Text, index: true, note: 'e.g., 39' },
  minor: { type: Types.Text, index: true, note: 'e.g., 0' },
  patch: { type: Types.Text, index: true, note: 'e.g., 2159' }
}, 'Meta', {
  totalVotes: { type: Types.Number, default: 0, noedit: true }
});

/**
 * Relationships
 */
UserAgent.relationship({ path: 'votes', ref: 'Vote', refPath: 'userAgent' });

/**
 * Schema Settings
 */

/**
 * Registration
 */

UserAgent.defaultColumns = 'family, major, totalVotes';
UserAgent.register();
