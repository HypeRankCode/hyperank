// ✅ Truly seamless ticker using JS duplication
document.addEventListener("DOMContentLoaded", () => {
  // ⛔ REMOVE this if you're using both — only one DOMContentLoaded needed

  // 🔥 Voting logic (keep as-is)
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
  

// ✅ Fixed seamless ticker with instant start and proper loop
document.addEventListener("DOMContentLoaded", () => {
  fetch("news.json")
    .then(res => res.json())
    .then(data => {
      const wrapper = document.querySelector(".ticker-track-wrapper");
      if (!wrapper || !Array.isArray(data)) return;

      const text = data.join(" &nbsp;&nbsp; • &nbsp;&nbsp; ");

      // Clear previous content if any
      wrapper.innerHTML = "";

      const ticker1 = document.createElement("div");
      const ticker2 = document.createElement("div");
      ticker1.className = "ticker-track";
      ticker2.className = "ticker-track";
      ticker1.innerHTML = text;
      ticker2.innerHTML = text;

      wrapper.appendChild(ticker1);
      wrapper.appendChild(ticker2);

      // Ensure content is loaded before measuring
      setTimeout(() => {
        let pos = 0;
        const speed = 0.5;
        const width = ticker1.offsetWidth;

        function animate() {
          pos -= speed;
          if (Math.abs(pos) >= width) {
            pos = 0;
          }
          wrapper.style.transform = `translateX(${pos}px)`;
          requestAnimationFrame(animate);
        }

        animate();
      }, 100);
    });
});

});
