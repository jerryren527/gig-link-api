require('dotenv').config()
const bcrypt = require('bcrypt');
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

    const hashedPassword = await bcrypt.hash('123123', 10);
    
    // Seed Users
    const users = [
      // User data objects
      {
        username: 'john.doe',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'Freelancer',
      },
      {
        username: 'jane.smith',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'Freelancer',
      },
      {
        username: 'michael.johnson',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Johnson',
        role: 'Freelancer',
      },
      {
        username: 'david.wilson',
        password: hashedPassword,
        firstName: 'David',
        lastName: 'Wilson',
        role: 'Client',
      },
      {
        username: 'sarah.brown',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Brown',
        role: 'Client',
      },
      {
        username: 'chris.taylor',
        password: hashedPassword,
        firstName: 'Chris',
        lastName: 'Taylor',
        role: 'Client',
      },
      {
        username: 'guest.client',
        password: hashedPassword,
        firstName: 'Guest',
        lastName: 'Client',
        role: 'Client',
      },
      {
        username: 'guest.freelancer',
        password: hashedPassword,
        firstName: 'Guest',
        lastName: 'Freelancer',
        role: 'Freelancer',
      },
      {
        username: 'guest.admin',
        password: hashedPassword,
        firstName: 'Guest',
        lastName: 'Admin',
        role: 'Admin',
      },
    ];
    await User.create(users);

    const david = await User.findOne({ username: 'david.wilson' }).exec()
    const sarah = await User.findOne({ username: 'sarah.brown' }).exec()
    const chris = await User.findOne({ username: 'chris.taylor' }).exec()
    const guestClient = await User.findOne({ username: 'guest.client' }).exec()
    const guestFreelancer = await User.findOne({ username: 'guest.freelancer' }).exec()
    const guestAdmin = await User.findOne({ username: 'guest.admin' }).exec()

    // Seed Jobs
    const jobs = [
      {
        title: 'Web Development Project',
        description: 'Build a responsive website for a small business.',
        client: david._id, // ID of the client user in the 'users' collection
        clientUsername: david.username, // ID of the client user in the 'users' collection
        skills: ['HTML', 'CSS', 'JavaScript'],
        price: 100,
        startDate: new Date(Date.now()),
        dueDate: new Date(Date.now() + 100 * 60 * 60 * 24),
        status: 'Pending',
        proposals: [], // Array of proposal IDs
      },
      {
        title: 'Graphic Design Project',
        description: 'Create a logo and branding materials for a startup company.',
        client: sarah._id, // ID of the client user in the 'users' collection
        clientUsername: sarah.username, // Username of the client user in the 'users' collection
        skills: ['Adobe Photoshop', 'Illustrator'],
        price: 50,
        startDate: new Date(Date.now() + 10 * 60 * 60 * 24),
        dueDate: new Date(Date.now() + 30 * 60 * 60 * 24),
        status: 'Pending',
        proposals: [], // Array of proposal IDs
      },
      {
        title: 'Mobile App Development',
        description: 'Build a cross-platform mobile app for a fitness tracking application.',
        client: guestClient._id, // ID of the client user in the 'users' collection
        clientUsername: guestClient.username, // Username of the client user in the 'users' collection
        skills: ['React Native', 'Firebase'],
        price: 200,
        startDate: new Date(Date.now() + 5 * 60 * 60 * 24),
        dueDate: new Date(Date.now() + 60 * 60 * 24 * 30),
        status: 'Pending',
        proposals: [], // Array of proposal IDs
      },
    ];
    await Job.create(jobs);

    const job = await Job.findOne({ title: 'Web Development Project'}).exec()
    david.openJobs = [...david.openJobs, job._id]
    await david.save()

    const john = await User.findOne({ username: 'john.doe' }).exec()


    const reviews = [
      {
        client: david._id, // ID of the client user in the 'users' collection
        freelancer: john._id, // ID of the freelancer user in the 'users' collection
        review: 'Great experience working with him! Highly recommended!',
        rating: 5,
      },
      {
        client: sarah._id, // ID of the client user in the 'users' collection
        freelancer: john._id, // ID of the freelancer user in the 'users' collection
        review: "His service was satisfactory. Met my requirements.",
        rating: 3,
      },
      {
        client: chris._id, // ID of the client user in the 'users' collection
        freelancer: guestFreelancer._id, // ID of the freelancer user in the 'users' collection
        review: "GuestFreelancer did an excellent job on the project. Very professional.",
        rating: 4,
      },
      {
        client: guestClient._id, // ID of the client user in the 'users' collection
        freelancer: guestFreelancer._id, // ID of the freelancer user in the 'users' collection
        review: "GuestFreelancer did a poor job on the project. Also did not meet the deadline.",
        rating: 2,
      },
    ]

    await Review.create(reviews);

    const davidReview = await Review.findOne({ client: david._id }).exec()
    const sarahReview = await Review.findOne({ client: sarah._id }).exec()
    const chrisReview = await Review.findOne({ client: chris._id }).exec()
    const guestClientReview = await Review.findOne({ client: guestClient._id }).exec()

    // add review ref to Jerry's User.freelancerReviews
    john.freelancerReviews = [...john.freelancerReviews, davidReview._id, sarahReview._id]
    john.overallRating = 4
    guestFreelancer.freelancerReviews = [...guestFreelancer.freelancerReviews, chrisReview._id, guestClientReview._id]
    guestFreelancer.overallRating = 3
    await john.save()
    await guestFreelancer.save()
    // add review ref to Thomas's User.clientReviews
    david.clientReviews = [...david.clientReviews, davidReview._id]
    await david.save()
    // add review ref to Kirkland's User.clientReviews
    sarah.clientReviews = [...sarah.clientReviews, sarahReview._id]
    await sarah.save()
    
    chris.clientReviews = [...chris.clientReviews, chrisReview._id]
    await chris.save()
    
    guestClient.clientReviews = [...guestClient.clientReviews, guestClientReview._id]
    await guestClient.save()


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
