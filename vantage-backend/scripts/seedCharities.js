import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Charity from '../models/Charity.js';

dotenv.config();

const seedData = [
  {
    name: 'Clean Water Initiative',
    category: 'Water',
    description: 'Delivering safe drinking water to rural communities across sub-Saharan Africa.',
    impact: '2.4M people served',
    raised: 1200000,
    featured: true,
    events: [
      { title: 'Golf Day', location: 'Lagos' },
      { title: 'Charity Walk', location: 'Global' },
    ],
  },
  {
    name: 'Education For All',
    category: 'Education',
    description: 'Funding school infrastructure and teacher training in underserved regions.',
    impact: '18,000 students',
    raised: 840000,
    featured: false,
    events: [
      { title: 'Golf Classic', location: 'Mumbai' },
    ],
  },
  {
    name: 'Rural Health Clinics',
    category: 'Health',
    description: 'Building and equipping primary health clinics in remote communities.',
    impact: '340 clinics built',
    raised: 3100000,
    featured: false,
    events: [
      { title: 'Golf Day', location: 'Nairobi' },
      { title: 'Gala Dinner', location: 'Global' },
    ],
  },
  {
    name: 'Food Security Project',
    category: 'Food',
    description: 'Sustainable food programs combating malnutrition in conflict-affected zones.',
    impact: '90K meals/month',
    raised: 620000,
    featured: false,
    events: [
      { title: 'Golf Scramble', location: 'Dubai' },
    ],
  },
  {
    name: 'Women in STEM',
    category: 'Education',
    description: 'Scholarships and mentoring programs for girls pursuing science and technology.',
    impact: '4,200 scholars',
    raised: 510000,
    featured: false,
    events: [],
  },
  {
    name: 'Ocean Restoration Fund',
    category: 'Environment',
    description: 'Marine conservation and coastal community livelihood programs worldwide.',
    impact: '12K km restored',
    raised: 2800000,
    featured: false,
    events: [
      { title: 'Golf Day', location: 'Sydney' },
    ],
  },
];

const seedCharities = async () => {
  try {
    await connectDB();

    for (const charity of seedData) {
      await Charity.findOneAndUpdate(
        { name: charity.name },
        { ...charity, isActive: true },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log(`Seeded ${seedData.length} charities`);
  } catch (error) {
    console.error('Failed to seed charities:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedCharities();
