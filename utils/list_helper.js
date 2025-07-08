const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (blogs.length === 0) return 0;
  const likes = blogs.map(blog => blog.likes)
  return likes.reduce((sum, like) => sum + like, 0)
}

const favoriteBlogs = (blogs) => {
  if (blogs.length === 0) return 0;
  blogs.sort((x, y) => y.likes - x.likes)
  return blogs[0]
}

const mostBlogs = (blogs) => {
  blogCount = {}

  blogs.forEach(blog => {
    blogCount[blog.author] = (blogCount[blog.author] || 0) + 1
  })

  let maxAuthor = ''
  let maxBlog = 0

  for (const author in blogCount) {
    if (blogCount[author] > maxBlog) {
      maxAuthor = author
      maxBlog = blogCount[author]
    }
  }

  return { author: maxAuthor, blogs: maxBlog }
}

const mostLikes = (blogs) => {
  const likeCount = {}

  blogs.forEach(blog => {
    likeCount[blog.author] = (likeCount[blog.author] || 0) + blog.likes
  })

  let maxAuthor = ''
  let maxLikes = 0

  for (const author in likeCount) {
    if (likeCount[author] > maxLikes) {
      maxAuthor = author
      maxLikes = likeCount[author]
    }
  }

  return { author: maxAuthor, likes: maxLikes }
}


module.exports = { dummy, totalLikes, favoriteBlogs, mostBlogs, mostLikes }

// const mostBlogs = (blogs) => {
//   const authors = blogs.map(blog => blog.author)
//   const authorsObject = authors.map(author => ({author, blogs: 1}))

//   console.log("authors: ", authors)
//   console.log("authorsObject: ", authorsObject)

//   for (let i = 0; i < authors.length; i++) {
//     for (let j = i + 1; j <= authors.length; j++) {
//       if (authors[i] === authors[j]) {
//         authorsObject[i].blogs++
//         authorsObject.splice(j, 1, 'Duplicate')
//       }
//     }
//   }

//   console.log("authorsObject after splicing: ", authorsObject)

//   const authorsObjectNoDuplicates = authorsObject.filter(authorObject => authorObject !== 'Duplicate')

//   console.log("authorObjectNoDuplicates:", authorsObjectNoDuplicates)
//   authorsObjectNoDuplicates.sort((x, y) => y.blogs - x.blogs)
//   console.log("authorObject with most blogs: ", authorsObjectNoDuplicates[0])
//   return authorsObjectNoDuplicates[0]
// }