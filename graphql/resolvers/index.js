const postsResolver = require("./post");
const usersResolver = require("./user");
const commentsResolver = require("./comment");

module.exports = {
  Query: {
    ...postsResolver.Query,
  },
  Mutation: {
    ...usersResolver.Mutation,
    ...postsResolver.Mutation,
    ...commentsResolver.Mutation,
  },
};
