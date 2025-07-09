
document.addEventListener("DOMContentLoaded", () => {
  // 🔥 Handle voting buttons
  const voteCards = document.querySelectorAll(".vote-card");
  voteCards.forEach(card => {
    const up = card.querySelector(".vote-up");
    const down = card.querySelector(".vote-down");

    up.addEventListener("click", () => {
      up.textContent = "🔥 Voted!";
      up.disabled = true;
      down.disabled = true;
    });

    down.addEventListener("click", () => {
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
      alert("✅ Thanks! Your trend suggestion was submitted.");
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
