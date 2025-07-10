document.addEventListener("DOMContentLoaded", () => {
  // 🚀 Form submission
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

  // 🕒 Update timestamp
  const updateText = document.querySelector(".update-time p");
  if (updateText) {
    const minutes = Math.floor(Math.random() * 9) + 1;
    updateText.textContent = `Last updated: ${minutes} minutes ago`;
  }

  // 🔍 Search functionality
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

  // 📰 Ticker news
  fetch("news.json")
    .then(res => res.json())
    .then(data => {
      const wrapper = document.querySelector(".ticker-track-wrapper");
      if (!wrapper || !Array.isArray(data)) return;
      const text = data.join(" &nbsp;&nbsp; • &nbsp;&nbsp; ");
      wrapper.innerHTML = `<div class="ticker-track">${text}</div>`;
    });

// spacing
    fetch("trends.json")
      .then(res => res.json())
      .then(trends => {
        const grid = document.querySelector(".trending-grid");
        if (!grid) return;
        grid.innerHTML = "";

        const topTrends = trends.slice(0, 5); // Only use top 5 trends

        topTrends.forEach(trend => {
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
            spark.textContent = "X ▄▄▄▅▅";
          }

          const votes = document.createElement("div");
          votes.className = "trend-votes";
          votes.textContent = trend.votes + " votes";

          const hypeScore = document.createElement("div");
          hypeScore.className = "meta-info";
          const score = Math.round((trend.fire / trend.votes) * 100);
          hypeScore.textContent = "💥 HypeScore: " + score + "%";

          card.appendChild(title);
          card.appendChild(meta);
          card.appendChild(spark);
          card.appendChild(votes);
          card.appendChild(hypeScore);
          grid.appendChild(card);
        });
      });

      // 🆕 Add hardcoded "Which is better?" vote: Gyatt vs Rizz
      const voteSection = document.querySelector(".vote-section");
      const trendA = trends.find(t => t.name === "gyatt");
      const trendB = trends.find(t => t.name === "rizz");

      if (voteSection && trendA && trendB) {
        const compContainer = document.createElement("div");
        compContainer.className = "comparison-container";
        compContainer.innerHTML = `
          <div class="comparison-box">
            <button class="compare-btn" data-index="0">${trendA.label}</button>
            <span class="vs-text">vs</span>
            <button class="compare-btn" data-index="1">${trendB.label}</button>
          </div>
          <div class="compare-results" style="display:none; margin-top:1rem;"></div>
        `;
        voteSection.appendChild(compContainer);

        const buttons = compContainer.querySelectorAll(".compare-btn");
        const resultBox = compContainer.querySelector(".compare-results");

        let votes = [0, 0];

        buttons.forEach(btn => {
          btn.addEventListener("click", () => {
            const i = parseInt(btn.dataset.index);
            votes[i]++;
            const total = votes[0] + votes[1];
            const percent0 = Math.round((votes[0] / total) * 100);
            const percent1 = 100 - percent0;

            resultBox.style.display = "block";
            resultBox.innerHTML = `
              <strong>${trendA.label}</strong>: ${percent0}%<br>
              <strong>${trendB.label}</strong>: ${percent1}%
            `;

            buttons.forEach(b => {
              b.disabled = true;
              b.classList.add("clicked");
            });
          });
        });
      }
    });
});
