import EmailModal from '../model/email.model.js';
import queryString from 'node:querystring';

export const createEmail = async (req, res) => {
  const email = req.body.email;
  const emailName = email.name;
  const field_data = emailName.replace(' ', '_').toLowerCase();
  const newEmailModal = new EmailModal({
    ...email,
    unique_identifier: field_data,
    type: field_data,
    is_fixed: 0,
    created_at: new Date().toISOString(),
  });
  try {
    await newEmailModal.save();
    res.status(201).json({ email: newEmailModal });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const getEmails = async (req, res) => {
  const { pageNumber, pageSize, sortField, sortOrder, filter } = req.query;
  const parseFilterQueryString = queryString.decode(filter);
  Object.keys(parseFilterQueryString).forEach((key) => {
    if (
      parseFilterQueryString[key] === '' ||
      parseFilterQueryString[key] === null
    ) {
      delete parseFilterQueryString[key];
    }
    if (parseFilterQueryString[key]) {
      const addLikeOperator = {
        $regex: new RegExp(`^${  parseFilterQueryString[key]}`, 'i'),
      };
      parseFilterQueryString[key] = addLikeOperator;
    }
  });
  try {
    const startIndex = (Number(pageNumber) - 1) * pageSize; // get the starting index of every page
    const total = await EmailModal.find(parseFilterQueryString).countDocuments(
      {}
    );
    const emails = await EmailModal.find(parseFilterQueryString)
      .sort({ [sortField]: sortOrder })
      .limit(Number(pageSize))
      .skip(Number(startIndex));
    res.json({
      entities: emails,
      currentPage: Number(pageNumber),
      numberOfPages: Math.ceil(total / Number(pageSize)),
      totalCount: total,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getEmail = async (req, res) => {
  const { id } = req.params;
  try {
    const email = await EmailModal.findById(id);
    res.status(200).json(email);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateEmail = async (req, res) => {
  const { id } = req.params;
  const email = req.body.email;
  const emailName = email.name;
  const field_data = emailName.replace(' ', '_').toLowerCase();
  const updatedEmail = {
    ...email,
    unique_identifier: field_data,
    type: field_data,
    _id: id,
  };
  await EmailModal.findByIdAndUpdate(id, updatedEmail, { new: true });
  res.json(updatedEmail);
};

export const deleteEmail = async (req, res) => {
  const { id } = req.params;
  await EmailModal.findByIdAndDelete(id);
  res.json({ message: 'email deleted' });
};

export const deleteManyEmail = async (req, res) => {
  const { ids } = req.body;
  await EmailModal.deleteMany({ _id: { $in: ids } });
  res.json({ message: 'email deleted' });
};
