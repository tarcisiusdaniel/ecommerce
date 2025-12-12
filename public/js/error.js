const errorMsg = document.getElementById("error-msg");
const backBtn = document.getElementById("go-back");

const urlParams = new URLSearchParams(window.location.search);
const encodedMsg = urlParams.get("msg");
const decoded = encodedMsg === "" ? "" : atob(encodedMsg);

errorMsg.innerText = decoded;
