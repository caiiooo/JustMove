const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chat");
const checkAuth = require("../middleware/check-auth");
var multer  = require('multer')
var upload = multer()

// View messages to and from authenticated user
//router.get("/", checkAuth, ChatController.getConversations);

// Retrieve single conversation
router.get("/:placeId", ChatController.getConversation);

// Send reply in conversation
router.post("/:placeId", checkAuth, upload.none(), ChatController.sendReply);

// Start new conversation
//router.post("/new/:recipient", checkAuth, ChatController.newConversation);

// router.post('/', (req, res, next) =>{
//     const place = {
//         modalityId: req.body.modalityId,
//         name: req.body.name
//     }
//     res.status(201).json({
//         message:'Places post!',
//         createdPlace:place
//     });
// });

// router.get('/:orderId', (req, res, next) =>{
//     res.status(200).json({
//         message:'Places details!',
//         id: req.params.orderId
//     });
// });

// router.delete('/:orderId', (req, res, next) =>{
//     res.status(200).json({
//         message:'Place deleted!',
//         id: req.params.orderId
//     });
// });

module.exports = router;
