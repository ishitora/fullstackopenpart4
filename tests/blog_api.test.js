const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');

const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const api = supertest(app);

const blogList = [
    {
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
    },
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
    },
    {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12,
    },
    {
        title: 'Canonical string reduction',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    },
    {
        author: 'Robert C. Martin',
        likes: 0,
        __v: 0,
    },
    {
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 2,
    },
];

let token = '';

beforeEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
    let newUser = {
        username: 'user',
        name: 'user',
        password: 'abcd',
    };
    const response = await api.post('/api/users').send(newUser);
    const res = await api.post('/api/login').send(newUser);
    token = 'Bearer ' + res.body.token;
    let blogObject = new Blog({ ...blogList[0], user: response.body.id });
    await blogObject.save();
    blogObject = new Blog({ ...blogList[1], user: response.body.id });
    await blogObject.save();
});

describe('get blog list', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    }, 10000);

    test('blog has id', async () => {
        const response = await api.get('/api/blogs');
        expect(response.body[0].id).toBeDefined();
    });
});

describe('addition of a new blog', () => {
    test('post API work', async () => {
        const beforePost = await api.get('/api/blogs');
        await api
            .post('/api/blogs')
            .set('Authorization', token)
            .send(blogList[2]);
        const afterPost = await api.get('/api/blogs');
        expect(afterPost.body.length).toBe(beforePost.body.length + 1);
        expect(afterPost.body[afterPost.body.length - 1]).toHaveProperty(
            'title',
            'Canonical string reduction'
        );

        expect(afterPost.body[afterPost.body.length - 1]).toHaveProperty(
            'author',
            'Edsger W. Dijkstra'
        );
    });

    test('default like is zero', async () => {
        await api
            .post('/api/blogs')
            .set('Authorization', token)
            .send(blogList[3]);

        const response = await api.get('/api/blogs');

        expect(response.body[response.body.length - 1].likes).toBe(0);
    });

    test('send http 400 when title and url properties are missing', async () => {
        const response = await api
            .post('/api/blogs')
            .set('Authorization', token)
            .send(blogList[4]);
        expect(response.status).toEqual(400);
    });

    test('send http 401 when no token ', async () => {
        const response = await api.post('/api/blogs').send(blogList[4]);
        expect(response.status).toEqual(401);
    });
});

describe('update a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        const blogsAtStart = await helper.blogsInDb();
        const blogToUpdate = blogsAtStart[0];

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send({ likes: 100 })
            .expect(204);

        const blogsAtEnd = await helper.blogsInDb();

        expect(blogsAtEnd).toHaveLength(2);
        const UpdatedBlog = blogsAtEnd[0];

        expect(UpdatedBlog.likes).toEqual(100);
    }, 10000);

    test("send http 400 when body hasn't likes", async () => {
        const blogsAtStart = await helper.blogsInDb();
        const blogToDelete = blogsAtStart[0];
        await api.put(`/api/blogs/${blogToDelete.id}`, {}).expect(400);
    });
});

describe('delete a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        const blogsAtStart = await helper.blogsInDb();
        const blogToDelete = blogsAtStart[0];

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', token)
            .expect(204);

        const blogsAtEnd = await helper.blogsInDb();

        expect(blogsAtEnd).toHaveLength(1);

        const titles = blogsAtEnd.map((r) => r.title);

        expect(titles).not.toContain(blogToDelete.title);
    }, 10000);

    test('send http 400 when id not find', async () => {
        await api

            .delete(`/api/blogs/${123456789}`)
            .set('Authorization', token)
            .expect(400);
    });
});

afterAll(() => {
    mongoose.connection.close();
});
