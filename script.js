import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.5/+esm';

const supabaseUrl = 'https://rrnucumzptbwdxtkccyx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybnVjdW16cHRid2R4dGtjY3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMDcxNDAsImV4cCI6MjA2NzY4MzE0MH0.HH923Txx1G6YXlJcKaDFVpEBK6WuLRT7adqQRi_Isj0';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
  // 🚀 Form submission
  const form = document.querySelector(".submit-form");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const inputs = form.querySelectorAll("input, textarea");
      const name = inputs[0].value.trim().toLowerCase();
      const label = inputs[0].value.trim();
      const description = inputs[1].value.trim();

      if (!name || !description) return;

      const { error } = await supabase.from("trends").insert({
        name,
        label,
        description,
        votes: 1,
        hype: 1
      });

      if (!error) {
        const popup = document.getElementById("custom-popup");
        popup.style.display = "block";
        setTimeout(() => popup.style.display = "none", 3000);
        form.reset();
      } else {
        console.error("Submission error:", error);
      }
    });
  }

  // 🕒 Update timestamp
  const updateText = document.querySelector(".update-time p");
  if (updateText) {
    updateText.textContent = `Last updated: ${new Date().toLocaleString()}`;
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
      const repeated = new Array(10).fill(text).join(" &nbsp;&nbsp; • &nbsp;&nbsp; ");
      wrapper.innerHTML = `<div class="ticker-track">${repeated}</div>`;
    });

  // spacing
  (async () => {
    const { data: trends, error } = await supabase
      .from("trends")
      .select("*")
      .order("votes", { ascending: false });

    if (error) {
      console.error("Failed to fetch trends from Supabase:", error);
      return;
    }

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

      const ratio = trend.hype / trend.votes;
      const meta = document.createElement("div");
      const spark = document.createElement("div");

      if (ratio > 0.65) {
        meta.className = "trend-meta rising";
        meta.textContent = "🔺 Rising";
        spark.className = "sparkline green";
        spark.textContent = "▁▃▅▇▆";
      } else if (ratio < 0.4) {
        meta.className = "trend-meta falling";
        meta.textContent = "🔻 Falling";
        spark.className = "sparkline red";
        spark.textContent = "▆▅▃▂";
      } else {
        meta.className = "trend-meta mid";
        meta.textContent = "➖ Mid";
        spark.className = "sparkline orange";
        spark.textContent = "▄▄▄▅▅";
      }

      const votes = document.createElement("div");
      votes.className = "trend-votes";
      votes.textContent = trend.votes + " votes";

      const hypeScore = document.createElement("div");
      hypeScore.className = "meta-info";
      const score = Math.round((trend.hype / trend.votes) * 100);
      hypeScore.textContent = "💥 HypeScore: " + score + "%";

      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(spark);
      card.appendChild(votes);
      card.appendChild(hypeScore);
      grid.appendChild(card);
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
  })();
});
