import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.5/+esm';

const supabaseUrl = 'https://rrnucumzptbwdxtkccyx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybnVjdW16cHRid2R4dGtjY3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMDcxNDAsImV4cCI6MjA2NzY4MzE0MH0.HH923Txx1G6YXlJcKaDFVpEBK6WuLRT7adqQRi_Isj0';
const supabase = createClient(supabaseUrl, supabaseKey);

let currentUser = null;


// Auth modal functions
window.openAuth = () => {
  document.getElementById('authModal').style.display = 'flex';
};
window.closeAuth = () => {
  document.getElementById('authModal').style.display = 'none';
};
window.signIn = async () => {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
document.getElementById('authMsg').innerHTML = error
  ? `<i class="fas fa-exclamation-triangle" style="color:goldenrod;"></i> ${error.message}`
  : `<i class="fas fa-circle-check" style="color:limegreen;"></i> Signed in!`;
  if (!error) setTimeout(() => location.reload(), 1000);
};
window.signUp = async () => {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const username = document.getElementById('authUsername')?.value.trim();

  if (!email || !password || !username) {
    document.getElementById('authMsg').innerHTML = '<i class="fas fa-exclamation-triangle" style="color:goldenrod;"></i> Please fill in all fields (email, password, username).';
    return;
  }

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: username
      }
    }
  });

  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      document.getElementById('authMsg').innerHTML = '<i class="fas fa-exclamation-triangle" style="color:goldenrod;"></i> Email already in use. Try signing in.';
    } else {
      document.getElementById('authMsg').textContent = signUpError.message;
    }
    return;
  }

    document.getElementById('authMsg').innerHTML = '<i class="fas fa-check-circle" style="color:#4f4;"></i> Account created!';
};

window.logoutUser = async () => {
  await supabase.auth.signOut();
  location.reload();
};

window.resetPassword = async () => {
  const email = document.getElementById('authEmail').value;
  if (!email) {
    document.getElementById('authMsg').textContent = 'Please enter your email to reset password.';
    return;
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset`
  });
document.getElementById('authMsg').innerHTML = error
  ? `<i class="fas fa-exclamation-triangle" style="color:goldenrod;"></i> ${error.message}`
  : `<i class="fas fa-envelope" style="color:#4f4;"></i> Password reset email sent!`;
};

// DOM loaded

document.addEventListener("DOMContentLoaded", async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  currentUser = user;

  const emailSpan = document.getElementById('userEmailDisplay');
  const authBtn = document.getElementById('authBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const voteNotice = document.getElementById('voteNotice');
  
  const params = new URLSearchParams(window.location.search);
if (params.get('login') === 'true') {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'flex';

  // Optional: Clear ?login=true from URL
  history.replaceState({}, document.title, window.location.pathname);
}

  if (user) {
    const username = user.user_metadata?.display_name || user.email;
    emailSpan.textContent = `Welcome, ${username}`;
    authBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    if (voteNotice) voteNotice.style.display = 'none';
  } else {
    emailSpan.textContent = '';
    authBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    if (voteNotice) voteNotice.style.display = 'block';
  }

if (currentUser) {
  renderVotePair(); // 🎯 Load first voting pair automatically
}


//cutoff
  const form = document.querySelector(".submit-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const inputs = form.querySelectorAll("input, textarea");
      const name = inputs[0].value.trim().toLowerCase();
      const label = inputs[0].value.trim();
      const description = inputs[1].value.trim();
      if (!name || !description) return;
      const { error } = await supabase.from("suggestions").insert({
        name,
        label,
        description,
        status: "pending",
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

  const updateText = document.querySelector(".update-time p");
  if (updateText) {
    updateText.textContent = `Last updated: ${new Date().toLocaleString()}`;
  }

  const searchForm = document.getElementById("trendSearchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const queryInput = document.getElementById("trendSearchInput");
      if (!queryInput) return;
      const query = queryInput.value.trim().toLowerCase();
      if (!query) return;
      try {
        const { data: trends, error } = await supabase
          .from("trends")
          .select("*")
          .ilike("name", `%${query}%`);
        const base = window.location.origin;
        if (error || !trends) {
          console.error("Error fetching trends:", error);
          window.location.href = `${base}/trend.html?term=${encodeURIComponent(query)}`;
          return;
        }
        if (trends.length > 0) {
          const trendData = trends[0];
          window.location.href = `${base}/trend.html?term=${encodeURIComponent(query)}&id=${trendData.id}`;
        } else {
          window.location.href = `${base}/trend.html?term=${encodeURIComponent(query)}`;
        }
      } catch (err) {
        console.error("Unexpected search error:", err);
        window.location.href = `${window.location.origin}/trend.html?term=${encodeURIComponent(query)}`;
      }
    });
  }
  
fetch("news.json")
  .then(res => res.json())
  .then(data => {
    const wrapper = document.querySelector(".ticker-track-wrapper");
    if (!wrapper || !Array.isArray(data)) return;

    const ticker = document.createElement("div");
    ticker.className = "ticker-track";
    wrapper.appendChild(ticker);

    const separator = " &nbsp;&nbsp; • &nbsp;&nbsp; ";
    const baseText = data.map(item => item.trim()).join(separator); // no trailing separator

    const numClones = 3;
    for (let i = 0; i < numClones; i++) {
      const span = document.createElement("div");
      span.className = "ticker-content";
      span.innerHTML = baseText;
      ticker.appendChild(span);
    }

    let position = 0;
    const speed = 0.3;

    function animateTicker() {
      position -= speed;
      ticker.style.transform = `translateX(${position}px)`;

      const first = ticker.children[0];
      if (first && position <= -first.offsetWidth) {
        position += first.offsetWidth;
        ticker.appendChild(first);
      }

      requestAnimationFrame(animateTicker);
    }

    requestAnimationFrame(animateTicker);
  });



// Voting system
async function renderVotePair() {
  const box = document.querySelector(".comparison-box");
  const resultDiv = document.querySelector(".compare-results");
  if (!box || !resultDiv) return;

  // Fade out only (but preserve layout)
  box.style.opacity = "0";
  box.style.transition = "opacity 0.3s ease";

  setTimeout(async () => {
    const { data: allTrends, error } = await supabase.from("trends").select("*");

    if (error || !allTrends || allTrends.length < 2) {
      box.innerHTML = "<p style='text-align:center;'>Not enough trends to vote yet.</p>";
      box.style.opacity = "1";
      return;
    }

    const [a, b] = allTrends.sort(() => 0.5 - Math.random()).slice(0, 2);

    box.innerHTML = ""; // Clear after fade out

    const createVoteBtn = (trend, opponent) => {
      const btn = document.createElement("button");
      btn.className = "vote-option";
      btn.textContent = trend.label;
      btn.style = "padding: 1rem; border-radius: 12px; background: #222; color: white; font-size: 1.2rem; border: 2px solid #444; cursor: pointer; margin: 0 1rem;";
      btn.onclick = async () => {
        const { error: moreError } = await supabase.from("trends").update({
          more: trend.more + 1
        }).eq("id", trend.id);

        const { error: lessError } = await supabase.from("trends").update({
          less: opponent.less + 1
        }).eq("id", opponent.id);

        if (moreError || lessError) {
          console.error("Voting error:", moreError || lessError);
          return;
        }

        // Skip confirmation box — go straight to next pair
        renderVotePair();
      };
      return btn;
    };

    box.appendChild(createVoteBtn(a, b));

    const vsText = document.createElement("span");
    vsText.textContent = "vs";
    vsText.style = "margin: 0 1rem; color: #888; font-weight: bold; font-size: 1.1rem;";
    box.appendChild(vsText);

    box.appendChild(createVoteBtn(b, a));

    // Fade back in smoothly
    requestAnimationFrame(() => {
      box.style.opacity = "1";
    });
  }, 300);
}


//spacing
try {
  const { data: trends, error } = await supabase
    .from("trends")
    .select("*");

  if (error) {
    console.error("Failed to fetch trends:", error);
    return;
  }

  const grid = document.querySelector(".trending-grid");
  if (!grid) return;

  grid.innerHTML = "";

  const maxVotes = Math.max(...trends.map(t => t.votes));
  const rankedTrends = trends
    .filter(t => (t.more + t.less) > 0)
    .map(t => {
      const hypeScore = t.more / (t.more + t.less);
      const voteScore = t.votes / maxVotes;
      const compositeScore = (hypeScore * 0.6) + (voteScore * 0.4);
      return { ...t, compositeScore };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore);

  const topTrends = rankedTrends.slice(0, 5);

  topTrends.forEach(trend => {
    const card = document.createElement("div");
    card.className = "trend-card";

    const title = document.createElement("div");
    title.className = "trend-title";
    title.textContent = trend.label;

    const hype = trend.hype || 0;
    const dead = trend.dead || 0;
    const total = hype + dead;

    let status = '<i class="fas fa-minus" style="color:orange;"></i> MID';
    let sparkClass = "orange";
    let sparkText = "▄▄▄▅▅";

    if (total > 0) {
      const hypeRatio = hype / total;
      const deadRatio = dead / total;

      if (hypeRatio > 0.6) {
        status = '<i class="fas fa-arrow-trend-up" style="color:limegreen;"></i> HOT';
        sparkClass = "green";
        sparkText = "▁▃▅▇▆";
      } else if (deadRatio > 0.6) {
        status = '<i class="fas fa-arrow-trend-down" style="color:#f44;"></i> NOT';
        sparkClass = "red";
        sparkText = "▆▅▃▂";
      }
    }

    const meta = document.createElement("div");
    meta.className = `trend-meta ${sparkClass}`;
    meta.innerHTML = status;

    const spark = document.createElement("div");
    spark.className = `sparkline ${sparkClass}`;
    spark.textContent = sparkText;

    const votes = document.createElement("div");
    votes.className = "trend-votes";
    votes.textContent = trend.votes + " votes";

    const hypeScore = document.createElement("div");
    hypeScore.className = "meta-info";

    const moreVotes = trend.more || 0;
    const lessVotes = trend.less || 0;
    const totalMoreVotes = moreVotes + lessVotes;

    const hypeVotes = trend.hype || 0;
    const deadVotes = trend.dead || 0;
    const totalMainVotes = hypeVotes + deadVotes;

    let score = 0;

    if (totalMoreVotes > 0 || totalMainVotes > 0) {
      const moreRatio = totalMoreVotes > 0 ? (moreVotes / totalMoreVotes) : 0;
      const mainRatio = totalMainVotes > 0 ? (hypeVotes / totalMainVotes) : 0;
      score = Math.round(((moreRatio * 0.6) + (mainRatio * 0.4)) * 100);
    }

    hypeScore.innerHTML = '<i class="fas fa-burst" style="color:#f44;"></i> HypeScore: ' + score + '%';

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
});
