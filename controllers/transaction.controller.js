// Define your transaction controller methods here

export const createTransaction = (req, res) => {
  res.status(200).send('Create Transaction endpoint');
};

export const getTransactions = (req, res) => {
  res.status(200).send('Get Transactions endpoint');
};

export const getTransactionById = (req, res) => {
  res.status(200).send(`Get Transaction with ID ${req.params.transactionId}`);
};