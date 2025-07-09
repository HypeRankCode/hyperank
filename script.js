document.addEventListener("DOMContentLoaded", () => {
  // 🔥 Voting logic
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

    const counter = document.createElement("div");
    counter.className = "fake-count";
    counter.textContent = "Votes: " + (Math.floor(Math.random() * 1000) + 200);
    card.appendChild(counter);
  });

  // 🚀 Form submit
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

  // ⏱️ Update timestamp
  const updateText = document.querySelector(".update-time p");
  if (updateText) {
    const minutes = Math.floor(Math.random() * 9) + 1;
    updateText.textContent = `Last updated: ${minutes} minutes ago`;
  }

  // 🔍 Search redirect
  const searchForm = document.getElementById("trendSearchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = document.getElementById("trendSearchInput").value.trim().toLowerCase();
      if (query) {
        const base = window.location.origin;
        window.location.href = `${base}/trend.html?term=${encodeURIComponent(query)}`;
      }
    });
  }

  // 📰 Simple news ticker (1-time animation)
  fetch("news.json")
    .then(res => res.json())
    .then(data => {
      const wrapper = document.querySelector(".ticker-track-wrapper");
      if (!wrapper || !Array.isArray(data)) return;

      const text = data.join(" &nbsp;&nbsp; • &nbsp;&nbsp; ");
      wrapper.innerHTML = `<div class="ticker-track">${text}</div>`;
    });

  // 🔢 Load trend data with sparklines + HypeScore
  fetch("trends.json")
    .then(res => res.json())
    .then(trends => {
      const grid = document.querySelector(".trending-grid");
      if (!grid) return;
      grid.innerHTML = ""; // clear any static content

      trends.forEach(trend => {
        const card = document.createElement("div");
        card.className = "trend-card";

        const title = document.createElement("div");
        title.className = "trend-title";
        title.textContent = trend.label;

        const meta = document.createElement("div");
        meta.className = "trend-meta";
        meta.textContent = trend.meta || "🧍 Mid";

        const spark = document.createElement("div");
        spark.className = "sparkline";
        spark.textContent = "📈 " + (trend.sparkline || "▁▃▅▇▆");

        const votes = document.createElement("div");
        votes.className = "trend-votes";
        votes.textContent = trend.votes + " votes";

        const hypeScore = document.createElement("div");
        hypeScore.className = "meta-info";
        const score = Math.round((trend.fire / trend.votes) * 100);
        hypeScore.textContent = "🔥 HypeScore: " + score + "%";

        card.appendChild(title);
        card.appendChild(meta);
        card.appendChild(spark);
        card.appendChild(votes);
        card.appendChild(hypeScore);
        grid.appendChild(card);
      });
    });
});
