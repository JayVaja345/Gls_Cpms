const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true
  },
  access: {
    type: [String],
    required: true
  }
})


module.exports = mongoose.model("roleModel",roleSchema)