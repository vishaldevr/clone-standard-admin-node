/* eslint-disable max-lines */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable prefer-const */
import UserModel from '../model/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import queryString  from 'node:querystring';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sendEmail from '../utils/sendMail.js';
import crypto from 'crypto';
import roleModel from '../model/role.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const signup = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    const oldUser = await UserModel.findOne({ email });
    if (oldUser) return res.status(400).json({ message: 'user_already_exist' });
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await UserModel.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
    });
    const token = jwt.sign(
      { email: result.email, id: result._id },
      // eslint-disable-next-line no-undef
      process.env.SECRET_KEY,
      {
        expiresIn: '1h',
      }
    );
    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: 'something_went_wrong', error: error });
  }
};
const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const oldUser = await UserModel.findOne({ email });
    if (!oldUser) return res.status(404).json({ message: 'user not exist' });
    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: 'invalid credential' });
    const token = jwt.sign(
      { email: oldUser.email, id: oldUser._id },
      // eslint-disable-next-line no-undef
      process.env.SECRET_KEY,
      {
        expiresIn: '10h',
      }
    );
    res
      .status(200)
      .json({ result: oldUser, token, message: 'Login successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'something_went_wrong', error: error });
  }
};

const signout = async (req, res) => {
  let authorization = req.headers.authorization,
    decoded;
  try {
    // eslint-disable-next-line no-unused-vars
    decoded = jwt.destroy(authorization);
    return res.status(200);
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }
};

const userDetails = async (req, res) => {
  let authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization, process.env.SECRET_KEY);
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  let userId = decoded.id;
  let user = await UserModel.findById(userId).lean();
  res.json({ data: user });
};

const updateProfile = async (req, res) => {
  let authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization, process.env.SECRET_KEY);
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  let userId = decoded.id;
  const user = await UserModel.findById(userId);

  const { name, phone_no } = req.body;
  if (!userId) return res.status(404).send('user not found');
  let updatedUser = { name, phone_no, _id: userId };

  if (typeof req.file !== 'undefined') {
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    updatedUser = { ...updatedUser, avatar: req.file.path };
  }
  if (req.body.password) {
    let pass = await bcrypt.hash(req.body.password, 12);
    updatedUser = { ...updatedUser, password: pass };
  }

  await UserModel.findByIdAndUpdate(userId, updatedUser, { new: true });
  const userData = await UserModel.findById({ _id: userId });
  res.status(200).json({ data: userData });
};

const resetPassword = async (req, res) => {
  let authorization = req.headers.authorization,
    decoded;

  try {
    decoded = jwt.verify(authorization, process.env.SECRET_KEY);
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  let userId = decoded.id;
  let passwordData = req.body.passwordData;

  let currentUser = await UserModel.findById(userId);
  if (!currentUser) return res.status(404).json({ message: 'user_not_exist' });

  let isPasswordCorrect = await bcrypt.compare(
    passwordData.currentPassword,
    currentUser.password
  );
  if (!isPasswordCorrect) return res.status(400).json({ message: 'old_password_not_correct' });

  let passwordCorrect = await bcrypt.compare(
    passwordData.password,
    currentUser.password
  );
  if (passwordCorrect) return res.status(400).json({ message: 'new_password_is_same_as_old' });

  let password = passwordData.password;
  let bcryptedPassword = await bcrypt.hash(password, 12);
  const updateData = { password: bcryptedPassword, _id: userId };

  await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
  const userData = await UserModel.findById({ _id: userId });

  res.status(200).json({ data: userData });
};

const forgotPassword = async function (req, res) {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res
      .status(404)
      .json({ success: false, message: 'User not found' });

    const resToken = await user.generatePasswordResetToken();
    const resetPasswordUrl = `/reset-password/${resToken}`;

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: 'Reset Your Password - URL Verification',
      // eslint-disable-next-line max-len
      text: `Dear User,\n\nYou have requested to reset your password. Please use the following URL code to proceed with the password reset process:\n\n Url: ${resetPasswordUrl}\n\nThis URL is valid for the next 5 minutes.\n\nIf you did not request this password reset, you can safely ignore this email.\n\nBest regards,\nYour Application Team`,
      html: `
              <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                  <h2 style="color: #0056b3;">Reset Your Password - URL Verification</h2>
                  <p>Dear User,</p>
                  <p>You have requested to reset your password. Please use the following URL code to proceed with the password reset process:</p>
                  <a href="http://localhost:5173${resetPasswordUrl}" style="font-weight: bold; font-size: 18px; background-color: #e8e8e8; padding: 10px; text-decoration: none; color: #000;">Reset Password</a>
                  <p>${resetPasswordUrl}</p>
                  <p style="font-size: 14px;">This URL is valid for the next 5 minutes.</p>
                  <p>If you did not request this password reset, you can safely ignore this email.</p>
                  <p>Best regards,</p>
                  <p>Your Application Team</p>
              </div>
          `,
    };

    try {
      await sendEmail(mailOptions);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
    res.status(200).json({
      success: true,
      message: `Password reset link sent to your email ${email}`,
    });
  } catch (error) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    user.save();
    res.status(500).json({
      error,
    });
  }
};

const resettPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  try {
    const forgotPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    if (!password) return res.status(400).json({ message: 'Password is required' });

    const user = await UserModel.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) return res
      .status(400)
      .json({ message: 'Token is invalid or expired, please try again' });

    let bcryptedPassword = await bcrypt.hash(password, 12);
    // Update the password if token is valid and not expired
    user.password = bcryptedPassword;

    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Somthing went wrong',
    });
  }
};

const activeAccount = async (req, res) => {
  let currentUser = await UserModel.findOne({
    account_activated_token: req.body.token,
  });
  if (currentUser.length === 0) {
    res.status(404).json({ message: 'user_not_exist' });
  } else {
    const updateData = { is_active: 1, _id: currentUser.id };
    await UserModel.findByIdAndUpdate(currentUser.id, updateData, {
      new: true,
    });
    const userData = await UserModel.findById({ _id: currentUser.id });
    res.status(200).json({ data: userData });
  }
};

const getUsers = async (req, res) => {
  const { pageNumber, pageSize, sortOrder, sortField, filter } = req.query;

  const parseFilterQueryString = queryString.decode(filter);

  Object.keys(parseFilterQueryString).forEach((key) => {
    if (
      parseFilterQueryString[key] === '' ||
      parseFilterQueryString[key] === null
    ) {
      delete parseFilterQueryString[key];
    }
    if (parseFilterQueryString[key] && (key === 'name' || key === 'email')) {
      let addLikeOperator = {
        $regex: new RegExp(`^${  parseFilterQueryString[key]}`, 'i'),
      };
      parseFilterQueryString[key] = addLikeOperator;
    }
  });

  try {
    const startIndex = (Number(pageNumber) - 1) * Number(pageSize);
    const total = await UserModel.find(parseFilterQueryString).countDocuments(
      {}
    );
    const users = await UserModel.find(parseFilterQueryString)
      .sort({ [sortField]: sortOrder })
      .limit(Number(pageSize))
      .skip(Number(startIndex));
    res.json({
      entities: users,
      currentPage: Number(pageNumber),
      numberOfPages: Math.ceil(total / Number(pageSize)),
      totalCount: total,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  const user = req.body;
  const avatar = typeof req.file !== 'undefined' ? req.file.path : '';
  const { password } = user;
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUserModel = new UserModel({
    ...user,
    password: hashedPassword,
    createdBy: req.userId,
    avatar: avatar,
    createdAt: new Date().toISOString(),
  });
  try {
    await newUserModel.save();
    let token = crypto.randomBytes(20).toString('hex');
    await UserModel.findByIdAndUpdate(
      { _id: newUserModel._id },
      { account_activated_token: token },
      { new: true }
    );
    // let data = {
    // 	'<user_name>': newUserModel.name,
    // 	'<link>': process.env.APP_FRONT_URL + '/actived_account?token=' + token
    // }
    // await sendEmail(user.email, 'welcome_email', data);
    res.status(201).json({ user: newUserModel });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id).populate('roles');
    // const modifyUser = {...user,roles:user.roles.map((role) => role.name)};
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const id = req.params.id;
  console.log('id: ', id);
  const { name, email, mobile_no, phone_no, note, is_active, password, roles } =
  req.body;
  console.log('req.body: ', req.body);
  console.log('password: ', password);
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ success: false, error: 'User Invalid!' });
    let updatedUser = {
      name,
      email,
      mobile_no,
      phone_no,
      note,
      _id: id,
      is_active,
      roles,
    };
 
    const user = await UserModel.findById(id);
 
    // const roleNames = await roleModel.find({ name: { $in: roles } }).select('_id');
    // console.log('roleNames: ', roleNames);
    // updatedUser = { ...updatedUser, roles: roleNames.map(role => role._id) };
 
    if (password !== '' && password !== null) {
      let bcryptedPassword = await bcrypt.hash(password, 12);
      updatedUser = { ...updatedUser, password: bcryptedPassword };
    }
 
    if (typeof req.file !== 'undefined') {
      if (user.avatar) {
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
 
      const avatar = typeof req.file !== 'undefined' ? req.file.path : '';
      updatedUser = { ...updatedUser, avatar };
    }
    await UserModel.findByIdAndUpdate(id, updatedUser, { new: true });
    res.json(updatedUser);
  } catch (error) {
    console.log('error: ', error);
  
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ success: false, error: 'User Invalid!' });

  const user = await UserModel.findById(id);
  if (user.avatar) {
    const oldAvatarPath = path.join(__dirname, '..', user.avatar);
    if (fs.existsSync(oldAvatarPath)) {
      fs.unlinkSync(oldAvatarPath);
    }
  }

  await UserModel.findByIdAndDelete(id);
  res.json({ message: 'user deleted ' });
};

// const deleteManyUser = async (req, res) => {
//   const { ids } = req.body;
//   await UserModel.deleteMany({ _id: { $in: ids } });
//   res.json({ message: "users deleted" });
// };

const deleteManyUser = async (req, res) => {
  const { ids } = req.body;

  try {
    const users = await UserModel.find({ _id: { $in: ids } });
    await UserModel.deleteMany({ _id: { $in: ids } });
    users.forEach(async (user) => {
      if (user.avatar) {
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);

        if (fs.existsSync(oldAvatarPath)) {
          try {
            fs.unlinkSync(oldAvatarPath);
          } catch (error) {
            console.error('Error deleting avatar:', error);
          }
        }
      }
    });

    res.json({ message: 'users and avatars deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller function to get unique permissions based on user roles
const getUserPermissions = async (req, res) => {
  let authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization, process.env.SECRET_KEY);
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  let userId = decoded.id;

  try {
    // Fetch the user by ID
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user roles
    const userRoles = user.roles;

    // Fetch permissions for each role
    const permissions = await roleModel
      .find({ name: { $in: userRoles } })
      .distinct('permission');

    // Flatten the permissions array and remove duplicates
    const uniquePermissions = [...new Set(permissions.flat())];

    // Send the unique permissions array to the client
    res.status(200).json({ permissions: uniquePermissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export {
  signin,
  signup,
  signout,
  userDetails,
  updateProfile,
  resetPassword,
  forgotPassword,
  resettPassword,
  activeAccount,
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  deleteManyUser,
  getUserPermissions,
};
