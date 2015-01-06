var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Video Model
 * ==========
 */

var Video = new keystone.List('Video', {
  autokey: { path: 'slug', from: 'youtubeId', unique: true },
  map: { name: 'meta.title' },
  defaultSort: 'name',
  track: true
});

Video.add({
  youtubeId: { type: Types.Text, initial: true, required: true, index: true, label: 'YouTube Video ID' },
}, 'Meta', {
  youtubeUrl: { type: Types.Url, noedit: true, watch: 'youtubeId', value: function (){
    return 'http://youtu.be/' + this.youtubeId;
  } },
  isActive: { type: Boolean, default: true, label: 'Is this video active?' },
  isFeatured: { type: Boolean, default: false, label: 'Is this video featured?' },
  meta: { type: Types.Embedly, from: 'youtubeUrl', label: 'Details', note: 'Extracted using Embed.ly' }
});

/**
 * Relationships
 */

/**
 * Registration
 */
Video.defaultColumns = 'name, category, isActive';
Video.register();
