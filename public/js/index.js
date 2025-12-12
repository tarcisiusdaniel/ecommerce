const productContainer = document.getElementById("render-products");
const currentPage = document.getElementById("current-page");
const maximumPage = document.getElementById("maximum-page");
const prevPageButton = document.getElementById("prev-button");
const nextPageButton = document.getElementById("next-button");
const searchButton = document.getElementById("search-btn");
const accountDropdown = document.getElementById("account-dropdown");

localStorage.setItem(
  "afterLoginURL",
  window.location.pathname + window.location.search
);

async function fetchAPI(url) {
  try {
    let response = await fetch(url);
    if (!response.ok) {
      return "Error";
    }
    let data = await response.json();

    return data;
  } catch (error) {
    return "Error";
  }
}

function createProductCard({ _id, name, image, brand, type }, loggedIn) {
  const productCard = document.createElement("div");
  productCard.className = "flex flex-col p-2";
  productCard.style.height = "350px";

  const productImg = document.createElement("img");
  productImg.src = image;
  productImg.alt = name;
  productImg.className = "cursor-pointer";
  productImg.style.height = "200px";
  productImg.style.objectFit = "contain";

  productImg.addEventListener("click", () => {
    window.location.href = `/product/${_id}`;
  });

  productCard.appendChild(productImg);

  const infoContainer = document.createElement("div");
  infoContainer.className = "flex flex-col flex-grow justify-between p-2 pt-5";

  const titleContainer = document.createElement("div");
  titleContainer.className = "flex flex-col";

  const title = document.createElement("h1");
  title.className = "text-xl mb-3";
  title.innerText = name;

  const tagContainer = document.createElement("div");
  tagContainer.className = "flex";

  const brandDiv = document.createElement("div");
  brandDiv.className = "border rounded-xl px-3 mr-2";
  brandDiv.innerText = brand;

  const typeDiv = document.createElement("div");
  typeDiv.className = "border rounded-xl px-3";
  typeDiv.innerText = type;

  tagContainer.appendChild(brandDiv);
  tagContainer.appendChild(typeDiv);

  titleContainer.appendChild(title);
  titleContainer.appendChild(tagContainer);
  infoContainer.appendChild(titleContainer);

  productCard.appendChild(infoContainer);

  if (loggedIn) {
    productCard.style.height = "470px";
    const favoriteButton = document.createElement("button");
    favoriteButton.innerText = "Add To Favorite";
    favoriteButton.className =
      "w-full h-12 mt-7 mb-5 border border-teal-400 rounded cursor-pointer hover:bg-black hover:text-white hover:border-black";
    favoriteButton.style.fontFamily = "'Figtree', sans-serif";

    favoriteButton.addEventListener("click", async () => {
      const makeFavApi = await fetch("/api/users/add/favorite", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: _id }),
      });

      if (makeFavApi.ok) alert("Added to favorite!");

      const favorites = document.getElementById("favorite-inner-container");
      if (!favorites) return;

      const favElementsId = new Set(
        Array.from(favorites.children).map((child) => child.id)
      );
      if (favElementsId.has(_id)) return;

      favorites.appendChild(createFavoriteCard(_id, name, image));
    });

    productCard.appendChild(favoriteButton);
  }

  return productCard;
}

function addProduct(product, loggedIn) {
  const currProductCard = createProductCard(product, loggedIn);
  productContainer.appendChild(currProductCard);
}

// Get the full query string from the current URL
const queryString = window.location.search; // ?page=1&brand=Nike%3BAdidas&type=Soccer

// Create a URLSearchParams object
const params = new URLSearchParams(queryString);

// Get individual parameters
const page = params.get("page"); // "1"
const brands = params.get("brand") ? params.get("brand").split(";") : []; // "Nike;Adidas"
const types = params.get("type") ? params.get("type").split(";") : []; // "Soccer"

// Get all checkboxes with name="brand"
const brandsCheckboxes = document.querySelectorAll('input[name="brand"]');

brandsCheckboxes.forEach((checkbox) => {
  if (brands.includes(checkbox.value)) {
    checkbox.checked = true;
  }
});

// Get all checkboxes with name="type"
const typesCheckboxes = document.querySelectorAll('input[name="types"]');

typesCheckboxes.forEach((checkbox) => {
  if (types.includes(checkbox.value)) {
    checkbox.checked = true;
  }
});

// console.log({ page, brand, type });

// fetch the products
fetchAPI(`/api/products?${buildProductQuery(page, brands, types)}`).then(
  async (products) => {
    try {
      const getUsername = await fetch("/api/users/verify");
      const getUsernameData = await getUsername.json();

      for (const product of products.products) {
        console.log("here");
        addProduct(product, getUsernameData.loggedIn);
      }

      // get the page, and the count
      currentPage.innerText = page ? page : 1;

      maximumPage.innerText =
        products.count > 0 ? Math.ceil(products.count / 9) : 1;

      if (currentPage.innerText === "1") {
        prevPageButton.disabled = true;
      } else {
        prevPageButton.disabled = false;
      }

      if (+page * 9 < products.count) {
        nextPageButton.disabled = false;
      } else {
        nextPageButton.disabled = true;
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// fetch the favorite products if the user is already login
fetchAPI("/api/products/favorites").then(async (favoriteProducts) => {
  if (favoriteProducts === "Error") {
    console.log("here");
    return;
  }
  // get the sign in button
  // delete it
  const navbar = document.querySelector("nav");
  const signInButton = document.getElementById("sign-in-button");
  signInButton.remove();

  const getUsername = await fetch("/api/users/verify");
  if (!getUsername.ok) {
    console.log(getUsername);
  }
  const getUsernameData = await getUsername.json();
  // insert Hello, username
  const welcomeMsg = document.createElement("span");
  welcomeMsg.className = "text-center self-center";
  welcomeMsg.innerText = "Hello, " + getUsernameData.username + "!";
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

  renderFavorites(favoriteProducts);
});

function renderFavorites(products) {
  // the line
  const mainSection = document.querySelector("main");
  const line = document.createElement("div");
  line.className = "w-px bg-gray-300 mx-10";
  mainSection.appendChild(line);

  const favoriteContainer = document.createElement("div");
  favoriteContainer.className = "w-70 h-96 pr-5";
  // favoriteContainer.style.height = "calc(100vh - 200px)";
  const h1 = document.createElement("h1");
  h1.classList.add("text-2xl", "font-bold", "text-gray-800", "mb-5");
  h1.style.fontFamily = "'Figtree', sans-serif";
  h1.textContent = "Favorites";
  favoriteContainer.appendChild(h1);

  const innerContainer = document.createElement("div");
  innerContainer.id = "favorite-inner-container";
  innerContainer.className = "w-full overflow-auto h-96 pr-5";
  innerContainer.style.height = "calc(100vh - 200px)";

  // Add cards inside scrollDiv
  products.forEach(({ _id, name, image }) => {
    innerContainer.appendChild(createFavoriteCard(_id, name, image));
  });

  favoriteContainer.appendChild(innerContainer);

  // Append to body
  mainSection.appendChild(favoriteContainer);
}

function createFavoriteCard(_id, name, image) {
  const productCard = document.createElement("div");
  productCard.className = "w-full h-fit-content";
  // insert image
  const prodImg = document.createElement("img");
  prodImg.src = image;
  prodImg.alt = name;
  prodImg.className = "mb-5 cursor-pointer";
  prodImg.addEventListener("click", () => {
    // go to the products page
    window.location.href = `/product/${_id}`;
  });
  // insert text
  const prodName = document.createElement("span");
  prodName.innerText = name;
  // button
  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.className =
    "w-full h-12 mt-7 mb-5 border border-teal-400 rounded cursor-pointer h-8 hover:bg-black hover:text-white hover:border-black";
  (deleteButton.style.fontFamily = "Figtree"), "sans-serif";
  // add event listener to the button
  deleteButton.addEventListener("click", async (e) => {
    const deleteFavApi = await fetch("/api/users/delete/favorite", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: _id,
      }),
    });

    if (deleteFavApi.ok) {
      alert("Deleted from favorite");
    }

    // delete in the UI
    const cardToDelete = e.target.parentElement;
    cardToDelete.remove();
  });

  productCard.appendChild(prodImg);
  productCard.appendChild(prodName);
  productCard.appendChild(deleteButton);
  productCard.id = _id;

  return productCard;
}

function buildProductQuery(page = 1, brands = [], types = []) {
  const params = new URLSearchParams();

  params.append("page", page);

  if (brands.length > 0) {
    params.append("brand", brands.join(";"));
  }

  if (types.length > 0) {
    params.append("type", types.join(";"));
  }

  return params.toString();
}

// next button listener
nextPageButton.addEventListener("click", async () => {
  const selectedBrands = [
    ...document.querySelectorAll('input[name="brand"]:checked'),
  ].map((cb) => cb.value);
  const selectedTypes = [
    ...document.querySelectorAll('input[name="types"]:checked'),
  ].map((cb) => cb.value);
  // increment currentpage by 1
  const updatedPage = +currentPage.innerText + 1;

  // make a query param
  const queryParam = buildProductQuery(
    updatedPage,
    selectedBrands,
    selectedTypes
  );

  window.location.href = `?${queryParam}`;

  // const data = await fetchAPI(`/api/products?${queryParam}`);

  // productContainer.innerHTML = "";
  // maximumPage.innerText = data.count > 0 ? Math.ceil(data.count / 9) : 1;
  // for (const product of data.products) {
  //   addProduct(product);
  // }

  // if (updatedPage * 9 >= data.count) {
  //   nextPageButton.disabled = true;
  // }
});

// prev page listener
prevPageButton.addEventListener("click", async () => {
  const selectedBrands = [
    ...document.querySelectorAll('input[name="brand"]:checked'),
  ].map((cb) => cb.value);
  const selectedTypes = [
    ...document.querySelectorAll('input[name="types"]:checked'),
  ].map((cb) => cb.value);
  // increment currentpage by 1
  const updatedPage = +currentPage.innerText - 1;

  // make a query param
  const queryParam = buildProductQuery(
    updatedPage,
    selectedBrands,
    selectedTypes
  );

  window.location.href = `?${queryParam}`;

  // const data = await fetchAPI(`/api/products?${queryParam}`);

  // productContainer.innerHTML = "";
  // maximumPage.innerText = data.count > 0 ? Math.ceil(data.count / 9) : 1;
  // for (const product of data.products) {
  //   addProduct(product);
  // }

  // if (updatedPage === 1) {
  //   prevPageButton.disabled = true;
  // }
});

// search button listener
searchButton.addEventListener("click", async () => {
  const selectedBrands = [
    ...document.querySelectorAll('input[name="brand"]:checked'),
  ].map((cb) => cb.value);
  const selectedTypes = [
    ...document.querySelectorAll('input[name="types"]:checked'),
  ].map((cb) => cb.value);
  // const currPage = +currentPage.innerText;
  const querySearch = buildProductQuery(1, selectedBrands, selectedTypes);

  window.location.href = `?${querySearch}`;

  // // convert it

  // if (selectedBrands.length === 0 && selectedTypes.length === 0) {
  //   return;
  // }

  // const updatedPage = 1;
  // currentPage.innerText = 1;
  // prevPageButton.disabled = true;

  // // make a query param
  // const queryParam = buildProductQuery(
  //   updatedPage,
  //   selectedBrands,
  //   selectedTypes
  // );

  // const data = await fetchAPI(`/api/products?${queryParam}`);

  // productContainer.innerHTML = "";
  // maximumPage.innerText = data.count > 0 ? Math.ceil(data.count / 9) : 1;
  // for (const product of data.products) {
  //   addProduct(product);
  // }
});
