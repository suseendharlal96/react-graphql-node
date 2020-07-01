const { AuthenticationError, UserInputError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../util/auth");

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: "desc" });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        console.log(
          "post",
          typeof post._id
          // ObjectId.toString(post._id).length
        );
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createPost(_, args, context) {
      const user = checkAuth(context);
      console.log(args);
      if (args.body.trim() === "") {
        throw new Error("Post must not be empty");
      }
      const newPost = new Post({
        body: args.body,
        userId: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();
      console.log(post);
      return post;
    },

    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);
      try {
        const post = await Post.findById(postId);
        if (user.username.trim() === post.username.trim()) {
          await post.deleteOne();
          return "Post deleted successfully";
        } else {
          throw new AuthenticationError(
            "Unauthorized to perform the operation"
          );
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    async likePost(_, { postId }, context) {
      const user = checkAuth(context);
      const post = await Post.findById(postId);
      if (post) {
        if (post.likes.find((like) => like.username === user.username)) {
          post.likes = post.likes.filter(
            (like) => like.username !== user.username
          );
        } else {
          post.likes.push({
            username: user.username,
            createdAt: new Date().toISOString(),
          });
        }
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
};
