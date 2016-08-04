var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Device Model
 * ==========
 */

var Device = new keystone.List('Device', {
  autokey: { path: 'slug', from: 'family major minor patch', unique: true },
  map: { name: 'family' },
  defaultSort: 'family',
  noedit: true,
  nocreate: true,
  nodelete: true,
  track: true
});

Device.add({
  family: { type: Types.Text, initial: true, required: true, index: true, note: 'e.g., iPad' },
  major: { type: Types.Text, index: true },
  minor: { type: Types.Text, index: true },
  patch: { type: Types.Text, index: true }
}, 'Meta', {
  totalVotes: { type: Types.Number, default: 0, noedit: true }
});

/**
 * Relationships
 */
Device.relationship({ path: 'votes', ref: 'Vote', refPath: 'device' });

/**
 * Schema Settings
 */

/**
 * Registration
 */

Device.defaultColumns = 'family, major, totalVotes';
Device.register();
