const getUserByEmail = (Email, database) => {
  for (let user in database) {
    if (Email === database[user].email) {
      return database[user];
    }
  }
  return null; //= new email, not in the users object yet
}

module.exports = getUserByEmail;