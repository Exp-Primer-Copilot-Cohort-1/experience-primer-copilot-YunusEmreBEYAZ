// Create web server

// Import express
const express = require('express');

// Import comment model
const Comment = require('../models/comment');

// Create router
const router = express.Router();

// Create comment
router.post('/comments', async (req, res) => {
    try {
        const comment = new Comment(req.body);
        await comment.save();
        res.status(201).send(comment);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Get comments
router.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find({});
        res.send(comments);
    } catch (e) {
        res.status(500).send();
    }
});

// Get comment by id
router.get('/comments/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).send();
        }
        res.send(comment);
    } catch (e) {
        res.status(500).send();
    }
});

// Update comment by id
router.patch('/comments/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['content', 'author'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'});
    }

    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        if (!comment) {
            return res.status(404).send();
        }
        res.send(comment);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Delete comment by id
router.delete('/comments/:id', async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) {
            return res.status(404).send();
        }
        res.send(comment);
    } catch (e) {
        res.status(500).send();
    }
});

// Export router
module.exports = router;