// Define your notification controller methods here

export const getNotifications = (req, res) => {
  res.status(200).send('Get Notifications endpoint');
};

export const markAsRead = (req, res) => {
  res.status(200).send(`Mark Notification with ID ${req.params.id} as read`);
};