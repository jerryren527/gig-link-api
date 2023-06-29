const express = require('express')
const router = express.Router()
const reviewsController = require('../controllers/reviewsController')

router.route('/')
  .get(reviewsController.getAllReviews)
  .post(reviewsController.createNewReview)
  .patch(reviewsController.updateReview)
  .delete(reviewsController.deleteReview)

module.exports = router