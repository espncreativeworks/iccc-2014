var keystone = require('keystone'),
_ = require('underscore'),
  Types = keystone.Field.Types;

/**
 * Coach Model
 * ==========
 */

var Coach = new keystone.List('Coach', {
  autokey: { path: 'slug', from: 'name', unique: true },
  defaultSort: 'sortName',
  drilldown: 'school charity',
  defaultColumns: 'isActive name totalVotes',
  track: true
});

Coach.add({
  name: { type: Types.Name, initial: true, required: true, index: true },
  school: { type: Types.Relationship, ref: 'School' },
  charity: { type: Types.Relationship, ref: 'Charity' },
  headshot: { type: Types.CloudinaryImage, autoCleanup : true, folder: 'infiniti/2015/coaches/' }
}, 'Meta', {
  isActive: { type: Boolean, default: false, index: true, label: 'On ballot?' },
  totalVotes: { type: Types.Number, default: 0, noedit: true },
  sortName: { type: Types.Text, index: true, noedit: true, watch: 'name', value: function (){
  	var self = this;
  	return (self.name.last + '-' + self.name.first).toLowerCase();
  } }
});

/**
 * Relationships
 */
Coach.relationship({ path: 'votes', ref: 'Vote', refPath: 'coach' });

Coach.schema.set('toJSON', {
  transform: function(doc, rtn, options) {
    var _doc = _.pick(doc, '_id', 'name', 'school', 'charity', 'headshot', 'isActive', 'totalVotes', 'slug', 'sortName');
    return _doc;
  }
});

/**
 * Registration
 */

Coach.defaultColumns = 'name, position, school, votes';
Coach.register();
