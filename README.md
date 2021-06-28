<h2>Book Directory API</h2>

Book directory api built using Node.js, Express and MongoDB(Mongoose).

Api : https://book-directory0.herokuapp.com
live : https://mohhamedhassan.github.io/goodReads/home

<h2>installation and running locally</h2>

npm install

npm start (port 3000)

npm run dev (nodemon) (port 3000)

<h2>Endpoints</h2>

<h4>POST REQUESTS</h4>

- Signup for a new account (name, email, password) with the ability to add a profile picture
  - https://book-directory0.herokuapp.com/signup

- Login (email, password)
  - https://book-directory0.herokuapp.com/login

- Add a new book (name, type, description, image)
  - https://book-directory0.herokuapp.com/add-book

- Set/update profile picture
  - https://book-directory0.herokuapp.com/profile-photo

- Update book image
  - https://book-directory0.herokuapp.com/book-image/:bookId

- Rate a book
  - https://book-directory0.herokuapp.com/rate-book/:bookId

- Logout
  - https://book-directory0.herokuapp.com/logout

<h4>PATCH REQUESTS</h4>

- Update profile info
  - https://book-directory0.herokuapp.com/update-user/:userId

- update a book
  - https://book-directory0.herokuapp.com/update-book/:bookId

<h4>GET REQUESTS</h4>

- View profile
  - https://book-directory0.herokuapp.com/profile

- View one book
  - https://book-directory0.herokuapp.com/single-book/:bookId

- View all books with skip and limit
  - https://book-directory0.herokuapp.com/all-books?limit=10&skip=0

- View signed in user's books
  - https://book-directory0.herokuapp.com/my-books

- Search book by name
  - https://book-directory0.herokuapp.com/book-by-name?bookName=arabic

- Search book by type
  - https://book-directory0.herokuapp.com/book-by-type?type=funny

- Search book by rate
  - https://book-directory0.herokuapp.com/book-by-rate?rate=4
