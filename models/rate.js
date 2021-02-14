const mongoose = require('mongoose')


const Rate = mongoose.Schema({
  rating: {
    type: Number,
    min: 0, max: 5,
    default: 0
  },
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratedBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  }
})

// userSchema.virtual('rates', {
//   ref: 'Rate',
//   localField: '_id',
//   foreignField: 'rater'
// })

module.exports = mongoose.model('Rate', Rate)
