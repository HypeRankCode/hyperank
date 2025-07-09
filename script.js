
document.addEventListener("DOMContentLoaded", () => {
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

  const updateText = document.querySelector(".update-time p");
  if (updateText) {
    const minutes = Math.floor(Math.random() * 9) + 1;
    updateText.textContent = `Last updated: ${minutes} minutes ago`;
  }

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

  fetch("news.json")
    .then(res => res.json())
    .then(data => {
      const wrapper = document.querySelector(".ticker-track-wrapper");
      if (!wrapper || !Array.isArray(data)) return;
      const text = data.join(" &nbsp;&nbsp; • &nbsp;&nbsp; ");
      wrapper.innerHTML = `<div class="ticker-track">${text}</div>`;
    });

  fetch("trends.json")
    .then(res => res.json())
    .then(trends => {
      const grid = document.querySelector(".trending-grid");
      if (!grid) return;
      grid.innerHTML = "";
      trends.forEach(trend => {
        const card = document.createElement("div");
        card.className = "trend-card";

        const title = document.createElement("div");
        title.className = "trend-title";
        title.textContent = trend.label;

        const ratio = trend.fire / trend.votes;
        const meta = document.createElement("div");
        const spark = document.createElement("div");

        if (ratio > 0.65) {
          meta.className = "trend-meta rising";
          meta.textContent = "🔺 Rising";
          spark.className = "sparkline green";
          spark.textContent = "📈 ▁▃▅▇▆";
        } else if (ratio < 0.4) {
          meta.className = "trend-meta falling";
          meta.textContent = "🔻 Falling";
          spark.className = "sparkline red";
          spark.textContent = "📉 ▆▅▃▂";
        } else {
          meta.className = "trend-meta mid";
          meta.textContent = "➖ Mid";
          spark.className = "sparkline orange";
          spark.textContent = "═══ ▄▄▄▅▅";
        }

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
