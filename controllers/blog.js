const blogRouter = require('express').Router();
const Blog = require('../models/blog');

const { userExtractor } = require('../utils/middleware');
blogRouter.get('/', async (request, response, next) => {
    try {
        const blogs = await Blog.find({}).populate('user', {
            username: 1,
            name: 1,
            id: 1,
        });
        response.json(blogs);
    } catch (error) {
        next(error);
    }
});

blogRouter.post('/', userExtractor, async (request, response, next) => {
    try {
        if (!request.body.title && !request.body.url) {
            throw new Error();
        }

        const user = request.user;

        const blog = new Blog({ ...request.body, user: user._id });

        if (blog.likes === undefined) {
            blog.likes = 0;
        }
        const result = await blog.save();

        user.blogs = user.blogs.concat(result._id);
        await user.save();
        response.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

blogRouter.put(`/:id`, async (request, response, next) => {
    try {
        if (!request.params.id || !(request.body.likes >= 0)) {
            throw new Error();
        }
        const blog = await Blog.findById(request.params.id);

        if (!blog) {
            throw new Error();
        }
        blog.likes = request.body.likes;
        await blog.save();
        response.status(204).send();
    } catch (error) {
        next(error);
    }
});

blogRouter.delete(`/:id`, userExtractor, async (request, response, next) => {
    try {
        if (!request.params.id) {
            throw new Error();
        }
        const user = request.user;

        const blog = await Blog.findById(request.params.id);
        if (blog === null) {
            throw new Error();
        }

        if (blog.user.toString() !== user.id.toString()) {
            return response.status(401).json({ error: 'not user' });
        }

        blog.remove();
        response.status(204).send();
    } catch (error) {
        next(error);
    }
});

module.exports = blogRouter;
