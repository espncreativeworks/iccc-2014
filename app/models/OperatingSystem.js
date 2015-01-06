var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * OperatingSystem Model
 * ==========
 */

var OperatingSystem = new keystone.List('OperatingSystem', {
  autokey: { path: 'slug', from: 'family major minor patch', unique: true },
  map: { name: 'family' },
  defaultSort: 'family',
  noedit: true,
  nocreate: true,
  nodelete: true,
  track: true
});

OperatingSystem.add({
  family: { type: Types.Text, initial: true, required: true, index: true, note: 'e.g., Mac OS X' },
  major: { type: Types.Text, index: true, note: 'e.g., 10' },
  minor: { type: Types.Text, index: true, note: 'e.g., 9' },
  patch: { type: Types.Text, index: true, note: 'e.g., 4' }
}, 'Meta', {
  totalVotes: { type: Types.Number, default: 0, noedit: true }
});

/**
 * Relationships
 */
OperatingSystem.relationship({ path: 'votes', ref: 'Vote', refPath: 'operatingSystem' });

/**
 * Schema Settings
 */

/**
 * Registration
 */

OperatingSystem.defaultColumns = 'family, major, totalVotes';
OperatingSystem.register();
