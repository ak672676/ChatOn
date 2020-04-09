const express = require("express");
const router = express.Router();
const middleware = require("./middleware/middleware");

const userCtrl = require("../controllers/users");
const fakeUsersCtrl = require("../controllers/fake-users");

//Login and Register
router.post("/register", userCtrl.registerUser);
router.post("/login", userCtrl.loginUser);

//Get Requests
router.get("/generate-feed", middleware.authorize, userCtrl.generateFeed);
router.get(
  "/get-search-results",
  middleware.authorize,
  userCtrl.getSearchResults
);

router.delete("/all", userCtrl.deleteAllUsers);
router.post(
  "/make-friend-request/:from/:to",
  middleware.authorize,
  userCtrl.makeFriendRequest
);

router.get(
  "/get-user-data/:userId",
  middleware.authorize,
  userCtrl.getUserData
);

router.get(
  "/get-friend-requests",
  middleware.authorize,
  userCtrl.getFriendRequests
);

router.post(
  "/resolve-friend-request/:from/:to",
  middleware.authorize,
  userCtrl.resolveFriendRequest
);

router.post("/create-post", middleware.authorize, userCtrl.createPost);
router.get("/all", userCtrl.getAllUsers);
router.post(
  "/like-unlike/:ownerid/:postid",
  middleware.authorize,
  userCtrl.likeUnlike
);

router.post(
  "/post-comment/:ownerid/:postid",
  middleware.authorize,
  userCtrl.postCommentOnPost
);

router.post("/create-fake-users", fakeUsersCtrl.createFakeUsers);

router.post("/send-message/:to", middleware.authorize, userCtrl.sendMessage);
router.post(
  "/reset-message-notifications",
  middleware.authorize,
  userCtrl.resetMessageNotifications
);

router.post(
  "/delete-message/:messageid",
  middleware.authorize,
  userCtrl.deleteMessage
);

router.post(
  "/bestie-enemy-toggle/:userid",
  middleware.authorize,
  userCtrl.bestieEnemyToggle
);

router.post(
  "/reset-alert-notifications",
  middleware.authorize,
  userCtrl.resetAlertNotifications
);

module.exports = router;
