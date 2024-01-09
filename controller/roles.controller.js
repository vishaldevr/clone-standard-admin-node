/* eslint-disable no-mixed-spaces-and-tabs */
import RoleModel from '../model/role.model.js';
import queryString from 'node:querystring';
const getRoles = async (req, res) => {
  const { pageNumber, pageSize, sortField, sortOrder, filter } = req.query;
  const parseFilterQueryString = queryString.decode(filter);

  Object.keys(parseFilterQueryString).forEach((key) => {
    if (
      parseFilterQueryString[key] === '' ||
      parseFilterQueryString[key] === null
    ) {
      delete parseFilterQueryString[key];
    }

    if (parseFilterQueryString[key] && key === 'name') {
      const addLikeOperator = {
        $regex: new RegExp(`^${  parseFilterQueryString[key]}`, 'i'),
      };
      parseFilterQueryString[key] = addLikeOperator;
    }
  });

  try {
    const startIndex = (Number(pageNumber) - 1) * pageSize;
    const total = await RoleModel.find(parseFilterQueryString).countDocuments(
      {}
    );
    const roles = await RoleModel.find(parseFilterQueryString)
      .sort({ [sortField]: sortOrder })
      .limit(Number(pageSize))
      .skip(Number(startIndex));
    res.json({
      entities: roles,
      currentPage: Number(pageNumber),
      numberOfPages: Math.ceil(total / Number(pageSize)),
      totalCount: total,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getRole = async (req, res) => { 
  const { id } = req.params;

  try {
    const role = await RoleModel.findById(id);
    res.status(200).json(role);
  } catch (error) {
    res.status(404).json({ message: error.message });
  	}
};

const createRole = async (req, res) => {
  const role = req.body.role;
  const newRoleModel = new RoleModel({ ...role, createdAt: new Date().toISOString() });

  try {
    await newRoleModel.save();
    res.status(201).json({ role: newRoleModel });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, is_active, permission } = req.body.role;
  const updatedRole = { name, is_active, permission, _id: id };
  await RoleModel.findByIdAndUpdate(id, updatedRole, { new: true });

  res.json(updatedRole);
};
const allRoles = async(req,res) => {
  try {
    const roles = await RoleModel.find();
    res.status(200).json({roles});
  } catch (error) {
    res.status(500).json({error:error.nessage});
  }
};

const deleteRole = async (req, res) => {
  const { id } = req.params;

  await RoleModel.findByIdAndDelete(id);

  res.json({ message: 'role deleted' });
};

const deleteManyRole = async (req, res) => {
  const { ids } = req.body;
  await RoleModel.deleteMany({ _id: { $in: ids } });
  res.json({ message: 'role deleted' });
};
export { getRoles ,getRole ,createRole,updateRole,deleteRole,deleteManyRole,allRoles};
