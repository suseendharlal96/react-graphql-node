const { AuthenticationError, UserInputError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../util/auth");

module.exports = {
  Mutation: {
    async postComment(_, { postId, body }, context) {
      const user = checkAuth(context);
      if (body.trim() === "") {
        throw new UserInputError("Post must not be empty", {
          errors: {
            body: "Must not be empty",
          },
        });
      }
      const post = await Post.findById(postId);
      if (post) {
        post.comments.unshift({
          body,
          username: user.username,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not found");
      }
    },

    async deleteComment(_, { postId, commentId }, context) {
      const user = checkAuth(context);
      const post = await Post.findById(postId);
      if (post) {
        const commentIndex = post.comments.findIndex(
          (comment) => comment.id === commentId
        );
        if (commentIndex !== -1) {
          if (post.comments[commentIndex].username === user.username) {
            post.comments.splice(commentIndex, 1);
            await post.save();
            return post;
          } else {
            throw new AuthenticationError("Unauthorized to perform");
          }
        } else {
          throw new UserInputError("Comment not found");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
};
