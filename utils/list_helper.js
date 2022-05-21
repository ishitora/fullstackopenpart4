const dummy = (blogs) => {
    return 1;
};

const totalLikes = (blogs) => {
    return blogs.reduce((preCount, cur) => {
        return preCount + cur.likes;
    }, 0);
};

const favoriteBlog = (blogs) => {
    const max = blogs.reduce(
        function (a, b) {
            return a.likes > b.likes ? a : b;
        },
        { likes: -Infinity }
    );

    if (!max.title) {
        return null;
    }
    return max;
};

const mostBlogs = (blogs) => {
    let authorList = [];
    blogs.forEach((blog) => {
        const author = authorList.find(
            (author) => author.author === blog.author
        );

        if (author) {
            author.blogs++;
        } else {
            authorList.push({
                author: blog.author,
                blogs: 1,
            });
        }
    });
    if (authorList.length === 0) {
        return null;
    }

    return authorList.reduce(
        function (a, b) {
            return a.blogs > b.blogs ? a : b;
        },
        { blogs: -Infinity }
    );
};

const mostLikes = (blogs) => {
    let authorList = [];
    blogs.forEach((blog) => {
        const author = authorList.find(
            (author) => author.author === blog.author
        );

        if (author) {
            author.likes += blog.likes;
        } else {
            authorList.push({
                author: blog.author,
                likes: blog.likes,
            });
        }
    });
    if (authorList.length === 0) {
        return null;
    }

    return authorList.reduce(
        function (a, b) {
            return a.likes > b.likes ? a : b;
        },
        { likes: -Infinity }
    );
};

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
};
