// create web server
const express = require('express');
const bodyParser = require('body-parser');
const {randomBytes} = require('crypto');
const cors = require('cors');

// create app
const app = express();
app.use(bodyParser.json());
app.use(cors());

// create comments array
const commentsByPostId = {};

// create get request
app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

// create post request
app.post('/posts/:id/comments', (req, res) => {
    // create random id for comment
    const commentId = randomBytes(4).toString('hex');
    // get comment content from request body
    const {content} = req.body;
    // get comments for post id
    const comments = commentsByPostId[req.params.id] || [];
    // add new comment to comments array
    comments.push({id: commentId, content, status: 'pending'});
    // add comments array to commentsByPostId object
    commentsByPostId[req.params.id] = comments;

    // emit event to event bus
    axios.post('http://localhost:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status: 'pending'
        }
    });

    // send response
    res.status(201).send(comments);
});

// create post request
app.post('/events', async (req, res) => {
    console.log('Event Received: ', req.body.type);

    const {type, data} = req.body;

    if (type === 'CommentModerated') {
        const {postId, id, status, content} = data;

        const comments = commentsByPostId[postId];

        const comment = comments.find(comment => {
            return comment.id === id;
        });

        comment.status = status;

        // emit event to event bus
        await axios.post('http://localhost:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,
                status,
                postId,
                content
            }
        });
    }

    res.send({});
});

// listen on port 4001
app.listen(4001, () => {
    console.log('Listening on 4001');
});
