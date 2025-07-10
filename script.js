import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.5/+esm';

const supabaseUrl = 'https://rrnucumzptbwdxtkccyx.supabase.co';
const supabaseKey = 'your-supabase-key'; // Replace this with your actual key
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
  // 🚀 Form submission
  const form = document.querySelector(".submit-form");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Get values from the form
      const inputs = form.querySelectorAll("input, textarea");
      const name = inputs[0].value.trim().toLowerCase();
      const label = inputs[0].value.trim();
      const description = inputs[1].value.trim();

      // Validation check
      if (!name || !description) return;

      // Insert the suggestion into the "suggestions" table (make sure the table exists in Supabase)
      const { error } = await supabase.from("suggestions").insert({
        name,
        label,
        description,
        status: "pending", // Added status to filter and manage suggestions
      });

      // Show confirmation popup
      if (!error) {
        const popup = document.getElementById("custom-popup");
        popup.style.display = "block";
        setTimeout(() => popup.style.display = "none", 3000); // Hide after 3 seconds
        form.reset(); // Reset the form
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

  // spacing: Fetch trends from Supabase and display
  (async () => {
    try {
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

      grid.innerHTML = ""; // Clear the grid

      const topTrends = trends.slice(0, 5); // Only use the top 5 trends

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
    } catch (err) {
      console.error("Error fetching trends:", err);
    }
  })();
});  
