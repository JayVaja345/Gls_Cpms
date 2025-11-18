const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const placementRecordSchema = new Schema({
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  totalPlaced:{
    type: Number,
    required: true,
    default: 0,
  },
  year: {
    type: Number,
    required: true,
    default: new Date().getFullYear()
  }
});

module.exports = mongoose.model('PlacementRecord', placementRecordSchema);
