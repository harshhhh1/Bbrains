// Define your role controller methods here

export const getRoles = (req, res) => {
  res.status(200).send('Get Roles endpoint');
};

export const createRole = (req, res) => {
  res.status(200).send('Create Role endpoint');
};

export const deleteRole = (req, res) => {
  res.status(200).send(`Delete Role with ID ${req.params.roleId}`);
};