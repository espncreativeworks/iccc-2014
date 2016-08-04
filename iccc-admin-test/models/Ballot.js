var keystone = require('keystone'),
_ = require('underscore'),
	Types = keystone.Field.Types;

/**
 * Ballot Model
 * ==========
 */

var Ballot = new keystone.List('Ballot', {
	autokey: { path: 'slug', from: 'title', unique: true },
	defaultSort: '-startedAt',
	map: { name: 'title' },
	defaultColumns: 'title isActive totalVotes',
	track: true
});

Ballot.add({
	title: { type: Types.Text, initial: true, required: true, index: true },
	startedAt: { type: Types.Datetime, default: Date.now, label: 'Start Date' },
	endedAt: { type: Types.Datetime, default: Date.now, label: 'End Date' },
	nextPhase: { type: Types.Datetime, default: Date.now, label: 'Next Phase Start Date' },
	coaches: { type: Types.Relationship, ref: 'Coach', many: true }
}, 'Meta', {
	visualization: { type: Types.Text, initial: true, required: true, index: true },
	isActive: { type: Boolean, default: false, index: true, label: 'Current ballot?' },
	totalVotes: { type: Types.Number, default: 0, noedit: true }
});

/**
 * Relationships
 */
Ballot.relationship({ path: 'votes', ref: 'Vote', refPath: 'ballot' });

Ballot.schema.pre('save', function (next){
	var Coach = keystone.list('Coach').model
	  , self = this
	  , _conditions = { }
	  , _update = { $set: { isActive: false } }
	  , _options = { multi: true };
	
	if (self.isActive){
		Coach.update(_conditions, _update, _options).exec().then(function (result) {
			_conditions = { _id: { $in: self.coaches } };
			_update = { $set: { isActive: true } };
			console.log(result);
			return Coach.update(_conditions, _update, _options).exec();
		}, function (err){
			console.error(err);
			next(err);
		}).then(function (result){
			console.log(result);
			next();
		}, function (err){
			console.error(err);
			next(err);
		});
	} else {
		next();
	}
});

Ballot.schema.set('toJSON', {
	transform: function(doc, rtn, options) {
		var _doc = _.pick(doc, '_id', 'title', 'startedAt', 'endedAt', 'nextPhase', 'coaches', 'isActive', 'totalVotes', 'visualization', 'slug');
		return _doc;
	}
});

/**
 * Registration
 */

Ballot.defaultColumns = 'title, totalVotes';
Ballot.register();

