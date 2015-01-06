var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * IpAddress Model
 * ==========
 */

var IpAddress = new keystone.List('IpAddress', {
  autokey: { path: 'slug', from: 'address', unique: true },
  map: { name: 'address' },
  defaultSort: 'address',
  label: 'IP Address',
  singular: 'IP Address',
  plural: 'IP Addresses',
  noedit: true,
  nocreate: true,
  nodelete: true,
  track: true
});

IpAddress.add({
  address: { type: Types.Text, initial: true, required: true, index: true, note: 'e.g., 192.234.2.49' },
  location: { type: Types.Location }
}, 'Meta', {
  totalVotes: { type: Types.Number, default: 0, noedit: true }
});

/**
 * Relationships
 */
IpAddress.relationship({ path: 'votes', ref: 'Vote', refPath: 'ipAddress' });

/**
 * Schema Settings
 */

/**
 * Registration
 */

IpAddress.defaultColumns = 'name, location, totalVotes';
IpAddress.register();
