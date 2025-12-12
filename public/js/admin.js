const logoutButton = document.getElementById("log-out-button");

localStorage.setItem(
  "afterLoginURLForAdmin",
  window.location.pathname + window.location.search
);

logoutButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const logoutResponse = await fetch("/api/users/logout");
  if (!logoutResponse.ok) {
    console.log(logoutResponse);
  }

  alert("Logout successful");
  window.location.href = "/";
});

function createUserData(row, withLine) {
  const dataRow = document.createElement("div");
  dataRow.className = "flex flex-col";

  const h1 = document.createElement("h1");
  h1.innerText = row.username;
  h1.className = "text-4xl";
  dataRow.appendChild(h1);

  const paragraph = document.createElement("p");
  paragraph.innerText = `Total favorite: ${row.products.length}`;
  dataRow.appendChild(paragraph);

  const favoriteProducts = document.createElement("div");
  favoriteProducts.className = "flex overflow-x-auto gap-10";
  for (const product of row.products) {
    favoriteProducts.append(createProductCard(product));
  }
  dataRow.appendChild(favoriteProducts);
  if (withLine) {
    console.log("here");
    const line = document.createElement("hr");
    line.className = "border my-5 border-gray-300";
    dataRow.appendChild(line);
  }
  return dataRow;
}

function createProductCard({ _id, name, image, type }) {
  const productCard = document.createElement("div");
  productCard.className = "flex flex-row p-5 gap-10";
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

  return productCard;
}

function createStatistics(data) {
  const statisticsDiv = document.createElement("div");
  statisticsDiv.className = "flex min-h-fit overflow-x-auto mb-10 ";

  //create the div to show count of user
  statisticsDiv.appendChild(createUserCount(data.data.length));

  return statisticsDiv;
}

function createUserCount(count) {
  const userDiv = document.createElement("div");
  userDiv.className =
    "border rounded-lg border-red-200 flex flex-col items-center justify-center h-60 w-70";

  //create the contents: user image and count
  const icon = document.createElement("img");
  icon.src = "utility/user.png";
  icon.className = "size-20";

  const h1 = document.createElement("h1");
  h1.className = "text-3xl font-thin";
  h1.innerText = `Total User: ${count}`;

  userDiv.appendChild(icon);
  userDiv.appendChild(h1);

  return userDiv;
}

fetch("/api/users/all")
  .then(async (response) => {
    let data = await response.json();
    // console.log(data.data.length);
    const main = document.querySelector("main");
    main.appendChild(createStatistics(data));
    if (data.data.length > 0) {
      main.className = "flex flex-col overflow-y-auto p-7";
      main.style.height = "calc(100vh - 120px)";
      let i = 0;
      for (const row of data.data) {
        main.appendChild(createUserData(row, i++ !== data.data.length - 1));
      }
    }
  })
  .catch((error) => {
    console.log(error);
  });
