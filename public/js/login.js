// get the form element
const form = document.querySelector("form");
const referrerUrl = new URL(document.referrer);
if (referrerUrl.hostname !== window.location.hostname) {
  localStorage.setItem("afterLoginURL", "");
  localStorage.setItem("afterLoginURLForAdmin", "/admin");
}

// add an event listener to handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  // get the form data
  const usernameOrEmail = formData.get("username-or-email");
  const password = formData.get("password");
  // create the request payload
  const userCreds = { usernameOrEmail, password };
  // console.log(userCreds);
  try {
    // send a POST request to the backend
    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userCreds),
    });
    const data = await response.json();
    if (response.ok) {
      console.log("here");
      // login successful
      alert(data.message);
      // redirect to a protected page or dashboard
      if (data.role === "admin") {
        window.location.href = !localStorage.getItem("afterLoginURLForAdmin")
          ? "/admin"
          : localStorage.getItem("afterLoginURLForAdmin");
        // window.location.href = "/admin";
      } else {
        window.location.href = !localStorage.getItem("afterLoginURL")
          ? "/"
          : localStorage.getItem("afterLoginURL");
        // window.location.href = "/";
      }
    } else {
      // login failed
      alert(data.message);
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("An error occurred. Please try again later.");
  }
});
