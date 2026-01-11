// Define your product controller methods here

export const getProducts = (req, res) => {
  res.status(200).send('Get Products endpoint');
};

export const createProduct = (req, res) => {
  res.status(200).send('Create Product endpoint');
};

export const getProductById = (req, res) => {
  res.status(200).send(`Get Product with ID `);
};

export const updateProduct = (req, res) => {
  res.status(200).send(`Update Product with ID`);
};

export const deleteProduct = (req, res) => {
  res.status(200).send(`Delete Product with ID`);
};