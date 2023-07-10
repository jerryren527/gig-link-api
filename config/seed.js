require('dotenv').config()
// Require dependencies and models
const mongoose = require('mongoose');
const User = require('../models/User')
const Job = require('../models/Job')
const Message = require('../models/Message')
const Proposal = require('../models/Proposal')
const Request = require('../models/Request')
const Review = require('../models/Review')
const connectDB = require('./dbConnect')
// Other required models

// Seed logic
const seedData = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI)
    // Code to seed the database
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Message.deleteMany({}),
      Proposal.deleteMany({}),
      Request.deleteMany({}),
      Review.deleteMany({}),
    ]);

    // Seed Users
    const users = [
      // User data objects
      {
        username: 'jerry.ren',
        password: '123123',
        firstName: 'Jerry',
        lastName: 'Ren',
        role: 'Freelancer',
      },
      {
        username: 'kennis.kong',
        password: '123123',
        firstName: 'Kennis',
        lastName: 'Kong',
        role: 'Freelancer',
      },
      {
        username: 'kevin.zhu',
        password: '123123',
        firstName: 'Kevin',
        lastName: 'Zhu',
        role: 'Freelancer',
      },
      {
        username: 'thomas.chu',
        password: '123123',
        firstName: 'Thomas',
        lastName: 'Chu',
        role: 'Client',
      },
      {
        username: 'qing.zhu',
        password: '123123',
        firstName: 'Qing',
        lastName: 'Zhu',
        role: 'Client',
      },
      {
        username: 'kirkland.arjun',
        password: '123123',
        firstName: 'Kirkland',
        lastName: 'Arjun',
        role: 'Client',
      },
    ];
    await User.create(users);

    const thomas = await User.findOne({ username: 'thomas.chu' }).exec()

    // Seed Jobs
    const jobs = [
      {
        title: 'Web Development Project',
        description: 'Build a responsive website for a small business.',
        client: thomas._id, // ID of the client user in the 'users' collection
        clientUsername: thomas.username, // ID of the client user in the 'users' collection
        skills: ['HTML', 'CSS', 'JavaScript'],
        price: 1000,
        startDate: new Date('2023-07-01'),
        dueDate: new Date('2023-07-31'),
        status: 'Pending',
        proposals: [], // Array of proposal IDs
      },
    ];
    await Job.create(jobs);

    const job = await Job.findOne({ title: 'Web Development Project'}).exec()
    thomas.openJobs = [...thomas.openJobs, job._id]
    await thomas.save()

    const jerry = await User.findOne({ username: 'jerry.ren' }).exec()
    const kirkland = await User.findOne({ username: 'kirkland.arjun' }).exec()


    const reviews = [
      {
        client: thomas._id, // ID of the client user in the 'users' collection
        freelancer: jerry._id, // ID of the freelancer user in the 'users' collection
        review: 'Great experience working with this Jerry. Highly recommended!',
        rating: 5,
      },
      {
        client: kirkland._id, // ID of the client user in the 'users' collection
        freelancer: jerry._id, // ID of the freelancer user in the 'users' collection
        review: "He's aii",
        rating: 3,
      },
    ]

    await Review.create(reviews);

    const thomasReview = await Review.findOne({ client: thomas._id }).exec()
    const kirklandReview = await Review.findOne({ client: kirkland._id }).exec()

    // add review ref to Jerry's User.freelancerReviews
    jerry.freelancerReviews = [...jerry.freelancerReviews, thomasReview._id, kirklandReview._id]
    jerry.overallRating = 4
    await jerry.save()
    // add review ref to Thomas's User.clientReviews
    thomas.clientReviews = [...thomas.clientReviews, thomasReview._id]
    await thomas.save()
    // add review ref to Kirkland's User.clientReviews
    kirkland.clientReviews = [...kirkland.clientReviews, kirklandReview._id]
    await kirkland.save()


    console.log('Seed data inserted successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Run the seed logic
seedData();
