const Review = require('../models/Review')
const asyncHandler = require('express-async-handler')
const {REQUEST_STATUSES, ROLES} = require('../config/constants')
const User = require('../models/User')


// @desc Get all reviews
// @route GET /reviews
// @access Private
const getAllReviews = asyncHandler (async (req, res) => {
  const reviews = await Review.find().lean()

  if (!reviews?.length) {
    return res.status(400).json({ message: "No reviews found"})
  }

  res.json(reviews)
})


// @desc Create new review
// @route POST /reviews
// @access Private
const createNewReview = asyncHandler(async (req, res) => {
  const {client, freelancer, review, rating} = req.body

  if (!client || !freelancer || !review || !rating) {
    return res.status(400).json({ message: "Client, Freelancer, Review, Rating are required."})    
  }

  // Make sure that client has role client, and freelancer has role freelancer
  const clientObject = await User.findById(client).lean().exec()
  const freelancerObject = await User.findById(freelancer).lean().exec()

  if (clientObject.role !== ROLES.Client || freelancerObject.role !== ROLES.Freelancer) {
    return res.status(400).json({ message: "Client must be the reviewer, and Freelancer must be the reviewee."})
  }

  // check if client has reviewed the freelancer once before
  const duplicate = await Review.findOne({ client: client, freelancer: freelancer }).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: "Client has already reviewed this freelancer once before."})
  }
  
  const createdReview = await Review.create(req.body)

  if (createdReview) {
    // Calculate freelancer's new overallRating and to User.freelancerReviews
    const freelancerObject = await User.findById(freelancer).exec()
    const numOfFreelancerReviews = freelancerObject.freelancerReviews.length
    console.log("numOfFreelancerReviews + 1 =", Number(numOfFreelancerReviews) + 1)
    freelancerObject.freelancerReviews = [...freelancerObject.freelancerReviews, createdReview]
    
    const prevOverallRating = freelancerObject.overallRating ? freelancerObject.overallRating : 0
    const newOverallRating = ((prevOverallRating * Number(numOfFreelancerReviews)) + Number(rating)) / (Number(numOfFreelancerReviews) + 1)
    console.log("🚀 ~ file: reviewsController.js:56 ~ createNewReview ~ numOfFreelancerReviews:", numOfFreelancerReviews)
    console.log("🚀 ~ file: reviewsController.js:56 ~ createNewReview ~ rating:", rating)
    console.log("🚀 ~ file: reviewsController.js:56 ~ createNewReview ~ numOfFreelancerReviews:", numOfFreelancerReviews)
    console.log("🚀 ~ file: reviewsController.js:55 ~ createNewReview ~ newOverallRating:", newOverallRating)
    
    freelancerObject.overallRating = newOverallRating

    await freelancerObject.save()
    // await User.updateOne({ _id: freelancer}, { $push: { freelancerReviews: createdReview }})
    
    // Add createdReview to the client's to User.clientReviews 
    await User.updateOne({ _id: client }, { $push: { clientReviews: createdReview }})

    return res.status(201).json({ message: `New review for \'${freelancer}\' created.`})
  } else {
    return res.status(400).json({ message: 'Invalid review data received.'})
  }
})

// @desc Update a review
// @route PATCH /reviews
// @access Private
const updateReview = asyncHandler(async (req, res) => {
  const {reviewId, review, rating} = req.body
  
  if (!reviewId ||!review || !rating ) {
    return res.status(400).json({ message: "Review, Rating are required."})    
  }
  if (rating < 1 || rating > 5) {
    return res.status(409).json({ message: 'Rating must be between 1 and 5.'})
  }

  const reviewObject = await Review.findById(reviewId).exec()
  
  if (!reviewObject) {
    return res.status(400).json({ message: 'Review not found.'})
  }
  
  
  
  // If rating was chaged, then freelancer's overallRating must change.
  const prevRating = reviewObject.rating
  if (prevRating !== rating) {
    const freelancerObject = await User.findById(reviewObject.freelancer).exec()
    const numOfRatings = freelancerObject.freelancerReviews.length
    const overallRating = freelancerObject.overallRating ? freelancerObject.overallRating : 0
    const newOverallRating = ( overallRating * numOfRatings - prevRating + rating ) / numOfRatings
    freelancerObject.overallRating = Number(newOverallRating)
    await freelancerObject.save()
  }

  // Assign the updated job
  // Object.assign(reviewObject, { ...reviewObject, ...otherProperties})
  reviewObject.review = review
  reviewObject.rating = rating
  const updatedReview = await reviewObject.save()


  return res.json({ message: `Review for \'${updatedReview.freelancer}\', updated`})
})


// @desc Delete a review
// @route DELETE /reviews
// @access Private
const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.body

  if (!reviewId) {
    return req.status(400).json({ message: 'Review ID required.'})
  }

  const review = await Review.findById(reviewId).exec()

  if (!review) {
    return res.status(400).json({ message: 'Review not found.'})
  }

  const result = await Review.deleteOne({ _id: reviewId })

  // Remove review from freelancer's User.freelancerReview
  const freelancerObject = await User.findById(review.freelancer).exec()

  freelancerObject.freelancerReviews = freelancerObject.freelancerReviews.filter(review => review !== reviewId )
  
  // Update freelancer's User.overallRating
  const numOfRatings = freelancerObject.freelancerReviews.length
  const overallRating = freelancerObject.overallRating ? freelancerObject.overallRating : 0
  const newOverallRating = ( overallRating * numOfRatings - review.rating ) / (numOfRatings - 1)

  freelancerObject.overallRating = newOverallRating
  await freelancerObject.save()

  // Remove review from client's User.clientReview
  const clientObject = await User.findById(review.client).exec()

  clientObject.clientReviews = clientObject.clientReviews.filter(review => review._id !== reviewId )

  await clientObject.save()

  return res.json({message: `Review for \'${review.freelancer}\' with ID ${review._id} deleted`})
})


module.exports = {
  getAllReviews,
  createNewReview,
  updateReview,
  deleteReview
}
