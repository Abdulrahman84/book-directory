<h2>Book Directory API</h2>

Book directory api built using Node.js, Express and MongoDB(Mongoose).

Api : https://https://book-directory.onrender.com/home
<br>
live : https://mohhamedhassan.github.io/goodReads/home

<h2>installation and running locally</h2>

npm install

npm start (port 3000)

npm run dev (nodemon) (port 3000)

<h2>Endpoints</h2>

<h4>POST REQUESTS</h4>

- Signup for a new account (name, email, password) with the ability to add a profile picture
  - https://good-reads.onrender.com/signup

- Login (email, password)
  - https://good-reads.onrender.com/login

- Add a new book (name, type, description, image)
  - https://good-reads.onrender.com/add-book

- Set/update profile picture
  - https://good-reads.onrender.com/profile-photo

- Update book image
  - https://good-reads.onrender.com/book-image/:bookId

- Rate a book
  - https://good-reads.onrender.com/rate-book/:bookId

- Logout
  - https://good-reads.onrender.com/logout

<h4>PATCH REQUESTS</h4>

- Update profile info
  - https://good-reads.onrender.com/update-user/:userId

- update a book
  - https://good-reads.onrender.com/update-book/:bookId

<h4>GET REQUESTS</h4>

- View profile
  - https://good-reads.onrender.com/profile

- View one book
  - https://good-reads.onrender.com/single-book/:bookId

- View all books with skip and limit
  - https://good-reads.onrender.com/all-books?limit=10&skip=0

- View signed in user's books
  - https://good-reads.onrender.com/my-books

- Search book by name
  - https://good-reads.onrender.com/book-by-name?bookName=arabic

- Search book by type
  - https://good-reads.onrender.com/book-by-type?type=funny

- Search book by rate
  - https://good-reads.onrender.com/book-by-rate?rate=4
