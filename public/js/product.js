// Get product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = params.get("id") || window.location.pathname.split("/").pop(); // support /product/:id
// const makeFavButton = document.getElementById("make-fav");
// const deleteFavButton = document.getElementById("delete-fav");

localStorage.setItem(
  "afterLoginURL",
  window.location.pathname + window.location.search
);

// Fetch product details
fetch(`/api/products/${productId}`)
  .then(async (res) => {
    const data = await res.json();
    if (res.status === 422) {
      const encoded = btoa(data.message);
      window.location.href = "/error?msg=" + encoded;
    }
    return data;
  })
  .then(async (data) => {
    const product = data.product;
    // populate the page with product.name, product.image, product.brand, etc.
    const prodImg = document.getElementById("product-img");
    const prodName = document.getElementById("prod-name");
    const prodDesc = document.getElementById("prod-desc");
    const prodBrand = document.getElementById("prod-brand");
    const prodType = document.getElementById("prod-type");
    prodImg.src = product.image;
    prodName.innerText = product.name;
    prodDesc.innerText = product.description;
    prodBrand.innerText = product.brand;
    prodType.innerText = product.type;

    // render favorites related buttons
    const loginStatus = await fetch(`/api/users/verify`);
    if (!loginStatus.ok) {
      console.log(loginStatus);
    } else {
      // add logout button and welcome massage
      const loginStatusData = await loginStatus.json();
      const navbar = document.querySelector("nav");
      const signInButton = document.getElementById("sign-in-button");
      signInButton.remove();

      // insert Hello, username
      const welcomeMsg = document.createElement("span");
      welcomeMsg.className = "text-center self-center";
      welcomeMsg.innerText = "Hello, " + loginStatusData.username + "!";
      navbar.appendChild(welcomeMsg);

      // insert log out button as well
      // <a href="/login" id="sign-in-button" class="text-center self-center">
      //   Sign In
      // </a>;
      const logoutButton = document.createElement("a");
      logoutButton.innerText = "Log Out";
      logoutButton.className = "text-center self-center cursor-pointer";
      logoutButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const logoutResponse = await fetch("/api/users/logout");
        if (!logoutResponse.ok) {
          console.log(logoutResponse);
        }

        alert("Logout successful");
        window.location.href = !localStorage.getItem("afterLoginURL")
          ? "/"
          : localStorage.getItem("afterLoginURL");
      });
      navbar.appendChild(logoutButton);

      // add the favorite related buttons
      const productDetail = document.getElementById("product-detail");
      productDetail.appendChild(createFavoriteButtons());
    }

    const otherSameBrand = await fetch(`/api/products?brand=${product.brand}`);
    const sameBrandData = await otherSameBrand.json();

    for (const product of sameBrandData.products) {
      if (productId !== product._id) {
        addProduct(product);
      }
    }
  });

function createFavoriteButtons() {
  // container
  const container = document.createElement("div");
  container.className = "w-full flex gap-5";

  // Make Favorite button
  const makeFavBtn = document.createElement("button");
  makeFavBtn.id = "make-fav";
  makeFavBtn.className =
    "w-full h-12 border border-teal-400 rounded cursor-pointer hover:bg-black hover:text-white hover:border-black";
  makeFavBtn.style.fontFamily = "'Figtree', sans-serif";
  makeFavBtn.textContent = "Make Favorite";

  // make fav listener
  makeFavBtn.addEventListener("click", async () => {
    const makeFavApi = await fetch("/api/users/add/favorite", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: productId,
      }),
    });

    if (makeFavApi.ok) {
      alert("This product is in your favorite list now!");
    }

    const makeFavApiData = await makeFavApi.json();

    console.log(makeFavApiData);
  });

  // Delete Favorite button
  const deleteFavBtn = document.createElement("button");
  deleteFavBtn.id = "delete-fav";
  deleteFavBtn.className =
    "w-full h-12 border border-teal-400 rounded cursor-pointer hover:bg-black hover:text-white hover:border-black";
  deleteFavBtn.style.fontFamily = "'Figtree', sans-serif";
  deleteFavBtn.textContent = "Delete from Favorite";

  // delete fav listener
  deleteFavBtn.addEventListener("click", async () => {
    const deleteFavApi = await fetch("/api/users/delete/favorite", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: productId,
      }),
    });

    if (deleteFavApi.ok) {
      alert("This product is deleted from your favorite list successfully!");
    }

    const deleteFavApiData = await deleteFavApi.json();

    console.log(deleteFavApiData);
  });

  // Append children
  container.appendChild(makeFavBtn);
  container.appendChild(deleteFavBtn);

  return container;
}

function createProductCard({ _id, name, image, type }) {
  const productCard = document.createElement("div");
  productCard.className = "flex flex-row p-5 gap-10 cursor-pointer";
  productCard.style.minWidth = "fit-content";

  productCard.innerHTML = `
    <img
    src="${image}"
    alt="${name}"
    class="h-20"
  />
  <div>
    <h1>${name}</h1>
    <div id="prod-type" class="border rounded-xl px-3 w-fit mt-5">
      ${type}
    </div>
  </div>
  `;

  productCard.addEventListener("click", () => {
    window.location.href = `/product/${_id}`;
  });

  return productCard;
}

function addProduct(product) {
  const productContainer = document.getElementById("same-brands");
  const currProductCard = createProductCard(product);
  productContainer.appendChild(currProductCard);
}
