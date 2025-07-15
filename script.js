import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.5/+esm';

const supabaseUrl = 'https://rrnucumzptbwdxtkccyx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybnVjdW16cHRid2R4dGtjY3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMDcxNDAsImV4cCI6MjA2NzY4MzE0MH0.HH923Txx1G6YXlJcKaDFVpEBK6WuLRT7adqQRi_Isj0';
const supabase = createClient(supabaseUrl, supabaseKey);

let currentUser = null;

// ⬇️ New modal logic to force username after OAuth
function forceUsernameModal() {
  const modal = document.createElement("div");
  modal.style = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex;
    align-items: center; justify-content: center; z-index: 9999; flex-direction: column;
    font-family: 'Urbanist', sans-serif; color: white;
  `;

  modal.innerHTML = `
    <div style="background: #1a1a1a; padding: 2rem; border-radius: 12px; max-width: 90%; width: 350px; text-align: center;">
      <h2 style="margin-bottom: 1rem;">Pick a Username</h2>
      <input type="text" id="forceUsernameInput" placeholder="Unique username" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: none; background: #2a2a2a; color: white;" />
      <p id="forceUsernameError" style="color: #f44; font-size: 0.9rem; margin-top: 0.5rem;"></p>
      <button id="forceUsernameBtn" style="margin-top: 1rem; padding: 0.6rem 1.2rem; background: #ff3c3c; border: none; color: white; font-weight: bold; border-radius: 8px; cursor: pointer;">
        Save Username
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("forceUsernameBtn").onclick = async () => {
    const input = document.getElementById("forceUsernameInput");
    const errorText = document.getElementById("forceUsernameError");
    const username = input.value.trim().toLowerCase();

    if (!username.match(/^[a-z0-9_]{3,20}$/)) {
      errorText.textContent = "Only lowercase a-z, 0-9, _ (3–20 characters)";
      return;
    }

    const session = await supabase.auth.getSession();
    const user = session?.data?.session?.user;
    if (!user) {
      errorText.textContent = "User not authenticated.";
      return;
    }

    const { data: existing, error: checkError } = await supabase
      .from("usernames")
      .select("username")
      .ilike("username", username);

    if (checkError) {
      errorText.textContent = checkError.message;
      return;
    }

    if (existing && existing.length > 0) {
      errorText.textContent = "Username already taken.";
      return;
    }

    const { error: insertError } = await supabase
      .from("usernames")
      .insert({ id: user.id, username });

    if (insertError) {
      errorText.textContent = insertError.message;
    } else {
      modal.remove();
      location.reload();
    }
  };
}

// Auth modal functions
window.openAuth = () => {
  document.getElementById('authModal').style.display = 'flex';
  document.body.classList.add('modal-open'); // prevent scroll
};

window.closeAuth = () => {
  document.getElementById('authModal').style.display = 'none';
  document.body.classList.remove('modal-open'); // allow scroll
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


window.signInWithProvider = async (provider) => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: 'https://rrnucumzptbwdxtkccyx.supabase.co/auth/v1/callback',
    },
  });

  if (error) {
    document.getElementById('authMsg').innerHTML = `<i class="fas fa-exclamation-triangle" style="color:goldenrod;"></i> ${error.message}`;
  }
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

// Add last updated fetch for update-time
async function updateLastUpdatedTime() {
  const updateText = document.querySelector(".update-time p");
  if (!updateText) return;

  const { data, error } = await supabase
    .from('trends')
    .select('updated_at')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error || !data || !data[0] || !data[0].updated_at) {
    updateText.textContent = "Last updated: unknown";
    console.error(error || "No valid data returned from Supabase.");
    return;
  }

  const updatedAt = new Date(data[0].updated_at);
  updateText.textContent = `Last updated: ${formatTimeAgo(updatedAt)}`;
}

function formatTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

// Run it immediately
updateLastUpdatedTime();

function animateCount(el, endValue) {
  const duration = Math.min(4000, 500 + endValue * 0.01); // Cap at 4s max
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(progress * (endValue - start) + start);
    el.textContent = value.toLocaleString() + " votes";
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}


// DOM loaded

document.addEventListener("DOMContentLoaded", async () => {
	
  renderVotePair(); // 🎯 Load first voting pair automatically
	
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  currentUser = user;

  const meta = user?.user_metadata || {};

  // ❗ Force username for all OAuth sign-ins if missing
  if (user && !meta.display_name) {
    forceUsernameModal();
  }

  const emailSpan = document.getElementById('userEmailDisplay');
  const authBtn = document.getElementById('authBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const submitNotice = document.getElementById('submitNotice');
  
  const params = new URLSearchParams(window.location.search);
	
if (params.get('login') === 'true') {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'flex';

  // Optional: Clear ?login=true from URL
  history.replaceState({}, document.title, window.location.pathname);
}

if (user) {
  const meta = user.user_metadata || {};

  // Try to extract a better display name
  const username =
    meta.display_name ||
  //  meta.full_name || // Google
  //  meta.name ||      // Discord
  //  meta.user_name || // Discord fallback
    user.email;

 // Persist it into user_metadata if not already stored
 // if (!meta.display_name && username !== user.email) {
 //   await supabase.auth.updateUser({
 //     data: { display_name: username }
 //   });
 // }

  emailSpan.textContent = `Welcome, ${username}`;
  authBtn.style.display = 'none';
  logoutBtn.style.display = 'inline-block';
  if (submitNotice) submitNotice.style.display = 'none';
} else {
  emailSpan.textContent = '';
  authBtn.style.display = 'inline-block';
  logoutBtn.style.display = 'none';
  if (submitNotice) submitNotice.style.display = 'block';
}

if (currentUser) {
  checkAuthForSubmitForm();
}


//cutoff
  async function checkAuthForSubmitForm() {
    const { data: { user } } = await supabase.auth.getUser();

    const overlay = document.getElementById('submitOverlay');
    const form = document.querySelector('.submit-form');

    if (!user) {
      overlay.style.display = 'flex';
      form.style.pointerEvents = 'none';
      form.style.opacity = '0.3';
    } else {
      overlay.style.display = 'none';
      form.style.pointerEvents = 'auto';
      form.style.opacity = '1';
    }
  }

  // Run the check once page loads
  checkAuthForSubmitForm();


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

const { data, error } = await supabase
  .from('trends')
  .select('created_at')
  .order('created_at', { ascending: false })
  .limit(1);


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
const { data: allTrends, error } = await supabase
  .from("trends")
  .select("*")
  .or("tags.ilike.%slang%,tags.ilike.%genz%,tags.ilike.%dating%");

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
      btn.style =
        "padding: 1rem; border-radius: 12px; background: #222; color: white; font-size: 1.2rem; border: 2px solid #444; cursor: pointer; margin: 0 1rem;";
      btn.onclick = async () => {
        const { error: moreError } = await supabase
          .from("trends")
          .update({ more: trend.more + 1 })
          .eq("id", trend.id);

        const { error: lessError } = await supabase
          .from("trends")
          .update({ less: opponent.less + 1 })
          .eq("id", opponent.id);

        if (moreError || lessError) {
          console.error("Voting error:", moreError || lessError);
          return;
        }

        renderVotePair(); // Load next pair
      };
      return btn;
    };

    box.appendChild(createVoteBtn(a, b));

    const vsText = document.createElement("span");
    vsText.textContent = "vs";
    vsText.style =
      "margin: 0 1rem; color: #888; font-weight: bold; font-size: 1.1rem;";
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

  const maxVotes = Math.max(...trends.map(t => t.votes || 0));
  const rankedTrends = trends
    .filter(t => (t.hype + t.dead + t.votes) > 0) // include only active trends
    .map(t => {
      const hypeRatio = t.hype / Math.max(1, (t.hype + t.dead));
      const voteScore = t.votes / Math.max(1, maxVotes);
      const moreRatio = t.more / Math.max(1, (t.more + t.less));

      const compositeScore = (hypeRatio * 0.6) + (voteScore * 0.35) + (moreRatio * 0.05);
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
    votes.textContent = "0 votes"; // placeholder

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(votes, trend.votes);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

observer.observe(votes);


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
