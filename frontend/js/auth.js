/* ============================================================
   auth.js
   Handles the login and register forms via the shared
   apiRegister/apiLogin functions in api.js. Session storage is
   owned by api.js — don't redeclare API_BASE or session helpers
   here, that caused a duplicate-declaration crash.
============================================================ */

let selectedAccountType = "individual";

function selectAccountType(type) {
  selectedAccountType = type;
  document.getElementById("toggle-individual")?.classList.toggle("toggle-active", type === "individual");
  document.getElementById("toggle-organization")?.classList.toggle("toggle-active", type === "organization");
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const isRegister = document.getElementById("reg-email") !== null;

  try {
    if (isRegister) {
      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value;

      if (!name || !email || !password) {
        showToast("Please fill in name, email, and password.");
        return;
      }
      await apiRegister({ name, email, password, accountType: selectedAccountType });
      showToast("Account created!");
    } else {
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;

      if (!email || !password) {
        showToast("Please enter your email and password.");
        return;
      }
      await apiLogin({ email, password });
      showToast("Welcome back!");
    }
    setTimeout(() => { window.location.href = "index.html"; }, 900);
  } catch (err) {
    showToast(err.message || "Could not reach the server. Is it running?");
  }
}