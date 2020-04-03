const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Post = mongoose.model("Post");
const Comment = mongoose.model("Comment");
const timeAgo = require("time-ago");

const containsDuplicate = function(array) {
  array.sort();
  for (let i = 0; i < array.length; i++) {
    if (array[i] == array[i + 1]) {
      return true;
    }
  }
};

const addCommentDetails = function(posts) {
  return new Promise(function(resolve, reject) {
    let promises = [];
    for (let post of posts) {
      for (let comment of post.comments) {
        let promise = new Promise(function(resolve, reject) {
          User.findById(
            comment.commenter_id,
            "name profile_image",
            (err, user) => {
              if (err) {
                return res.json({ err: err });
              }
              comment.commenter_name = user.name;
              comment.commenter_profile_image = user.profile_image;
              resolve(comment);
            }
          );
        });
        promises.push(promise);
      }
    }
    Promise.all(promises).then(val => {
      console.log(val);
      resolve(posts);
    });
  });
};

const registerUser = function({ body }, res) {
  if (
    !body.first_name ||
    !body.last_name ||
    !body.password ||
    !body.email ||
    !body.password_confirm
  ) {
    return res.send({ message: "All fields are required." });
  }

  if (body.passport !== body.passport_confirm) {
    return res.send({ message: "Passwords don't match." });
  }

  const user = new User();

  // user.firstname = body.first_name.trim();
  // user.lastname = body.last_name.trim();

  user.name = body.first_name.trim() + " " + body.last_name.trim();
  user.email = body.email;
  user.setPassword(body.password);

  user.save((err, newUser) => {
    if (err) {
      if (
        err.errmsg &&
        err.errmsg.includes("duplicate key error") &&
        err.errmsg.includes("email")
      ) {
        return res.json({ message: "Provided Email is already registered." });
      }
      return res.json({ message: "Something went wrong" });
    } else {
      const token = newUser.getJwt();
      res.status(201).json({ token });
    }
  });
};

const loginUser = function(req, res) {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(400).json(err);
    }
    if (user) {
      const token = user.getJwt();

      res.status(201).json({ token });
    } else {
      res.json(info);
    }
  })(req, res);
};

const generateFeed = function({ payload }, res) {
  const posts = [];
  const maxAmountOfPosts = 48;
  function addToPosts(array, user) {
    for (item of array) {
      item.name = user.name;
      item.ago = timeAgo.ago(item.date);
      item.ownerid = user._id;
      item.ownerProfileImage = user.profile_image;
    }
  }

  let myPosts = new Promise(function(resolve, reject) {
    User.findById(
      payload._id,
      "name posts profile_image friends",
      { lean: true },
      (err, user) => {
        if (err) {
          return res.status(400).json(err);
        }
        addToPosts(user.posts, user);
        posts.push(...user.posts);
        resolve(user.friends);
      }
    );
  });

  let myFriendsPosts = myPosts.then(friendsArray => {
    return new Promise(function(resolve, reject) {
      User.find(
        { _id: { $in: friendsArray } },
        "name profile_image posts",
        { lean: true },
        (err, users) => {
          if (err) {
            return res.status(400).json(err);
          }
          for (user of users) {
            addToPosts(user.posts, user);
            posts.push(...user.posts);
          }
          resolve();
        }
      );
    });
  });
  myFriendsPosts.then(() => {
    posts.sort((a, b) => (a.date > b.date ? -1 : 1));

    finalPost = posts.slice(0, maxAmountOfPosts);
    addCommentDetails(finalPost).then(finalPost => {
      res.statusJson(200, { posts: finalPost });
    });
  });
};

const getSearchResults = function({ query, payload }, res) {
  if (!query.query) {
    return res.json({ err: "Missing a query" });
  }
  User.find(
    { name: { $regex: query.query, $options: "i" } },
    "name friends profile_image friend_requests",
    (err, results) => {
      if (err) {
        return res.json({ err: err });
      }
      results = results.slice(0, 20);
      for (let i = 0; i < results.length; i++) {
        if (results[i]._id == payload._id) {
          results.splice(i, 1);
          break;
        }
      }
      return res
        .status(200)
        .json({ message: "Getting search result", results: results });
    }
  );
};

const deleteAllUsers = function(req, res) {
  User.deleteMany({}, (err, info) => {
    if (err) {
      return res.send({ error: err });
    }
    return res.json({ messages: "Deleted All Users", info: info });
  });
};

const makeFriendRequest = function({ params }, res) {
  User.findById(params.to, (err, user) => {
    if (err) {
      return res.json({ err, err });
    }
    if (containsDuplicate([params.from, ...user.friend_requests])) {
      console.log(user);
      return res.json({ message: "Friend Request is already send" });
    }

    user.friend_requests.push(params.from);
    user.save((err, user) => {
      if (err) {
        return res.json({ err, err });
      }

      return res.statusJson(201, {
        message: "Successfully send a friend request."
      });
    });
  });
};

const getUserData = function({ params }, res) {
  User.findById(params.userId, (err, user) => {
    if (err) {
      return res.json({ err: err });
    }
    console.log(user);
    res.statusJson(200, { user: user });
  });
};

const getFriendRequests = function({ query }, res) {
  let friendRequests = JSON.parse(query.friend_requests);
  console.log(friendRequests);
  User.find(
    { _id: { $in: friendRequests } },
    "name profile_image",
    (err, users) => {
      if (err) {
        return res.json({ err: err });
      }
      return res.statusJson(200, {
        message: "Getting friend requests",
        users: users
      });
    }
  );
};

const resolveFriendRequest = function({ query, params }, res) {
  User.findById(params.to, (err, user) => {
    if (err) {
      return res.json({ err: err });
    }

    for (let i = 0; i < user.friend_requests.length; i++) {
      if (user.friend_requests[i] == params.from) {
        user.friend_requests.splice(i, 1);
        break;
      }
    }

    let promise = new Promise(function(resolve, reject) {
      if (query.resolution == "accept") {
        if (containsDuplicate([params.from, ...user.friends])) {
          return res.json({ message: "Dupliacte Error" });
        }

        user.friends.push(params.from);

        User.findById(params.from, (err, user) => {
          if (err) {
            return res.json({ err: err });
          }
          if (containsDuplicate([params.to, ...user.friends])) {
            return res.json({ message: "Dupliacte Error" });
          }
          user.friends.push(params.to);
          user.save((err, user) => {
            if (err) {
              return res.json({ err: err });
            }
            resolve();
          });
        });
      } else {
        resolve();
      }
    });

    promise.then(() => {
      user.save((err, user) => {
        if (err) {
          return res.json({ err: err });
        }
        res.statusJson(201, {
          message: "Resolved friend request"
        });
      });
    });
  });
};

const createPost = function({ body, payload }, res) {
  if (!body.content || !body.theme) {
    return res.statusJson(400, {
      message: "Insufficient data send with the request"
    });
  }
  let userId = payload._id;
  const post = new Post();
  post.theme = body.theme;
  post.content = body.content;

  User.findById(userId, (err, user) => {
    if (err) {
      return res.json({ err: err });
    }
    let newPost = post.toObject();
    newPost.name = payload.name;
    newPost.ownerid = payload._id;
    newPost.ownerProfileImage = user.profile_image;

    user.posts.push(post);
    user.save(err => {
      if (err) {
        return res.json({ err: err });
      }

      return res.statusJson(201, {
        message: "Created Post",
        newPost: newPost
      });
    });
  });
};

const getAllUsers = function(req, res) {
  User.find((err, users) => {
    if (err) {
      return res.send({ error: err });
    }
    return res.json({ users: users });
  });
};

const likeUnlike = function({ payload, params }, res) {
  User.findById(params.ownerid, (err, user) => {
    if (err) {
      return res.json({ err: err });
    }
    const post = user.posts.id(params.postid);
    if (post.likes.includes(payload._id)) {
      post.likes.splice(post.likes.indexOf(payload._id, 1));
    } else {
      post.likes.push(payload._id);
    }
    user.save((err, user) => {
      if (err) {
        return res.json({ err: err });
      }
      res.statusJson(201, { message: "Like or Unlike" });
    });
  });
};

const postCommentOnPost = function({ body, payload, params }, res) {
  User.findById(params.ownerid, (err, user) => {
    if (err) {
      return res.json({ err: err });
    }
    const post = user.posts.id(params.postid);
    let comment = new Comment();
    comment.commenter_id = payload._id;
    comment.comment_content = body.content;
    post.comments.push(comment);
    user.save((err, user) => {
      if (err) {
        return res.json({ err: err });
      }
      User.findById(payload._id, "name profile_image", (err, user) => {
        if (err) {
          return res.json({ err: err });
        }
        res.statusJson(201, {
          message: "Posted Comment",
          comment: comment,
          commenter: user
        });
      });
    });
  });
};

module.exports = {
  getAllUsers,
  deleteAllUsers,
  registerUser,
  loginUser,
  generateFeed,
  getSearchResults,
  makeFriendRequest,
  getUserData,
  getFriendRequests,
  resolveFriendRequest,
  createPost,
  likeUnlike,
  postCommentOnPost
};
