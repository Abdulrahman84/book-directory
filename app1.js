const info = {
  email: "abd11@gmail.com",
  password: 12345,
};

const fecthing = async (url = "", info = {}) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M…k5N30.FHNBk4rkultncck3XmrRaqeGBFKRyTOpvio7TTE8WhY",
    },
    body: JSON.stringify(info),
  });
  const data = await res.json();
  console.log(data);
};

// fecthing("https://book-directory0.herokuapp.com/signup", {
//   name: "mohamed",
//   email: "abd2@gmail.com",
//   password: "12345",
// });

fecthing("https://book-directory0.herokuapp.com/add-book", {
  name: "mohamed",
  email: "abd2@gmail.com",
});
