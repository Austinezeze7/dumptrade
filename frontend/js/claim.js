/* ============================================================
   claim.js
   Wires up the Claim / Mark as collected buttons on listing.html.
============================================================ */

async function handleClaim(id) {
  if (!isLoggedIn()) {
    showToast("Please log in to claim an item.");
    window.location.href = "login.html";
    return;
  }
  const result = await apiClaimListing(id);
  showToast(result.message);
  if (result.ok) rerenderDetail(id);
}

async function handleCollect(id) {
  const result = await apiCollectListing(id);
  showToast(result.message);
  if (result.ok) rerenderDetail(id);
}

async function rerenderDetail(id) {
  const container = document.getElementById("detail-container");
  const listing = await apiGetListingById(id);
  if (container && listing) container.innerHTML = detailHtml(listing);
}