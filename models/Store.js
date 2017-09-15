const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: 'Please enter a Store Name!'
	},
	slug: String,
	description: {
		type: String,
		trim: true
	},
	tags: [String],
	created: {
		type: Date,
		default: Date.now
	},
	location: {
		type: {
			type: String,
			default: 'Point'
		},
		coordinates: [{
			type: Number,
			required: 'You must supply Coordinates!'
		}],
		address: {
			type: String,
			required: 'You must supply an Address!'
		}
	},
	photo: String
});

storeSchema.pre('save', async function(next) {
	if (!this.isModified('name')) {
		next();
		return;
	}
	this.slug = slug(this.name);

	//Check for Store with same slug name!
	const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
	const storeWithSlug = await this.constructor.find({ slug: slugRegEx });
	if(storeWithSlug.length) {
		this.slug = `${this.slug}-${storeWithSlug.length + 1}`;
	}
	//Goto Next
	next();
});

storeSchema.statics.getTagsList = function() {
	return this.aggregate([
		{ $unwind: '$tags' },
		{ $group: { _id: '$tags', count: { '$sum': 1 } } },
		{ $sort: { count: -1 } }
	]);
};

module.exports = mongoose.model('Store', storeSchema);