// Define your announcement controller methods here

export const get_announcements = (req, res) => {
  res.status(200).send('Get Announcements endpoint');
};

export const createAnnouncement = (req, res) => {
  res.status(200).send('Create Announcement endpoint');
};

export const deleteAnnouncement = (req, res) => {
  res.status(200).send(`Delete Announcement with ID ${req.params.id}`);
};