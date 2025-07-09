
document.addEventListener("DOMContentLoaded", () => {
  // 🔥 Handle voting buttons
  const voteCards = document.querySelectorAll(".vote-card");
  voteCards.forEach(card => {
    const up = card.querySelector(".vote-up");
    const down = card.querySelector(".vote-down");

    up.addEventListener("click", () => {
      up.classList.add("clicked");
      up.textContent = "🔥 Voted!";
      up.disabled = true;
      down.disabled = true;
    });

    down.addEventListener("click", () => {
      down.classList.add("clicked");
      down.textContent = "💀 Voted!";
      down.disabled = true;
      up.disabled = true;
    });
  });

  // 🚀 Handle submit form
  const form = document.querySelector(".submit-form");
  if (form) {
    
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const popup = document.getElementById("custom-popup");
  popup.style.display = "block";
  setTimeout(() => popup.style.display = "none", 3000);
  form.reset();
});
  }

  // 🕒 Dynamic update time
  const updateText = document.querySelector(".update-time p");
  if (updateText) {
    const minutes = Math.floor(Math.random() * 9) + 1;
    updateText.textContent = `Last updated: ${minutes} minutes ago`;
  }
});

// Fake vote counts
document.querySelectorAll(".vote-card").forEach(card => {
  const counter = document.createElement("div");
  counter.className = "fake-count";
  counter.textContent = "Votes: " + (Math.floor(Math.random() * 1000) + 200);
  card.appendChild(counter);
});

// Filter trend cards by search
document.getElementById("trendSearch").addEventListener("input", function() {
  const val = this.value.toLowerCase();
  document.querySelectorAll(".trend-card").forEach(card => {
    const title = card.querySelector(".trend-title").textContent.toLowerCase();
    card.style.display = title.includes(val) ? "block" : "none";
  });
});

// Handle search form submit to redirect to a trend page
const searchForm = document.getElementById("trendSearchForm");
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = document.getElementById("trendSearchInput").value.trim().toLowerCase();
    if (query) {
      window.location.href = `trend.html?term=${encodeURIComponent(query)}`;
    }
  });
}
