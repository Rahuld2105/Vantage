import Charity from '../models/Charity.js';
import Donation from '../models/Donation.js';

export const getAll = async ({ category, search, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  
  const query = { isActive: true };
  
  if (category && category !== 'All') {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  
  const charities = await Charity.find(query)
    .sort({ featured: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Charity.countDocuments(query);
  
  return {
    charities,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getById = async (id) => {
  const charity = await Charity.findById(id);
  if (!charity || !charity.isActive) {
    throw { statusCode: 404, message: 'Charity not found' };
  }
  return charity;
};

export const create = async (data) => {
  const existingCharity = await Charity.findOne({ name: data.name });
  if (existingCharity) {
    throw { statusCode: 400, message: 'Charity name already exists' };
  }
  
  const charity = new Charity(data);
  await charity.save();
  return charity;
};

export const update = async (id, data) => {
  const charity = await Charity.findByIdAndUpdate(id, data, { new: true });
  if (!charity) {
    throw { statusCode: 404, message: 'Charity not found' };
  }
  return charity;
};

export const remove = async (id) => {
  const charity = await Charity.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!charity) {
    throw { statusCode: 404, message: 'Charity not found' };
  }
  return charity;
};

export const createDonation = async (charityId, data) => {
  const charity = await Charity.findById(charityId);
  if (!charity || !charity.isActive) {
    throw { statusCode: 404, message: 'Charity not found' };
  }

  const donation = new Donation({
    charityId,
    name: data.name,
    email: data.email,
    amount: data.amount,
    message: data.message,
  });

  await donation.save();
  charity.raised = (charity.raised || 0) + Number(data.amount || 0);
  await charity.save();

  return donation;
};
