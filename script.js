
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

    // Add fake vote counter
    const counter = document.createElement("div");
    counter.className = "fake-count";
    counter.textContent = "Votes: " + (Math.floor(Math.random() * 1000) + 200);
    card.appendChild(counter);
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

  // 🔎 Handle search redirect on enter
  const searchForm = document.getElementById("trendSearchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = document.getElementById("trendSearchInput").value.trim().toLowerCase();
      if (query) {
        // Strip hash fragment to prevent broken navigation
        const base = window.location.origin;
        window.location.href = `${base}/trend.html?term=${encodeURIComponent(query)}`;
      }
    });

    // 📰 Load headlines into ticker
fetch('news.json')
  .then(res => res.json())
  .then(data => {
    const tickerText = data.join(" &nbsp;&nbsp; • &nbsp;&nbsp; ");
    document.getElementById("ticker1").innerHTML = tickerText;
    document.getElementById("ticker2").innerHTML = tickerText; // identical copy for infinite scroll
  });
    
  }
});
