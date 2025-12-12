// i. Username
// 1. Min length, max length, no special characters
// ii. Email
// 1. Min length, max length, no special characters besides @ .
// 2. email@domain
// iii. Password
// 1. Must contain uppercase, lowercase, number, special characters
// 2. Min length, max length
// iv. Confirm Password: matches password

// get the form element
const form = document.querySelector("form");
console.log("Hello");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  // get form data
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  console.log(username);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/;

  // password validation
  if (password.length <= 7 || password.length >= 15) {
    alert(
      "password must be longer than 7 characters and shorter than 15 characters"
    );
    return;
  }
  if (!passwordRegex.test(password)) {
    alert(
      "password must contain uppercase, lowercase, number, special characters"
    );
    return;
  }
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }
  // username validation
  if (username.length <= 4 || username.length >= 30) {
    alert(
      "Username must be longer than 4 characters and shorter than 30 characters"
    );
    return;
  }
  if (!/^[A-Za-z0-9]+$/.test(username)) {
    alert("Username must be alphanumeric, no special characters.");
    return;
  }

  // email validation
  if (email.length <= 5 || email.length >= 50) {
    alert(
      "Email must be longer than 5 characters and shorter than 50 characters"
    );
    return;
  }
  if (!/^[A-Za-z0-9@.]+$/.test(email)) {
    alert("Min length, max length, no special characters besides @ and .");
    return;
  }
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
    alert("Format not allowed, allowed example: abcd123@gmail.com");
  }

  // send registration request to the backend
  try {
    const response = await fetch("/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password, confirmPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Registration successful! Please login.");
      window.location.href = "login"; // redirect to login page
    } else {
      alert(`Registration failed: ${data.message}`);
    }
  } catch (error) {
    console.error("Error during registration:", error);
    alert("An error occurred. Please try again later.");
  }
});
