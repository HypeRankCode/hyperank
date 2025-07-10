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
  document.getElementById('authMsg').textContent = error ? error.message : '✅ Signed in!';
  if (!error) setTimeout(() => location.reload(), 1000);
};
window.signUp = async () => {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const username = document.getElementById('authUsername')?.value.trim() || "";

  const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      document.getElementById('authMsg').textContent = '⚠️ Email is already in use. Try signing in or use a different email.';
    } else {
      document.getElementById('authMsg').textContent = signUpError.message;
    }
    return;
  }

  if (data.user) {
    await supabase.from("profiles").insert({ id: data.user.id, email, username });
    document.getElementById('authMsg').textContent = '✅ Account created!';
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
    redirectTo: `${window.location.origin}/reset.html`
  });
  document.getElementById('authMsg').textContent = error ? error.message : '📧 Password reset email sent!';
};

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;

  const emailSpan = document.getElementById('userEmailDisplay');
  const authBtn = document.getElementById('authBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (user) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    const username = profileData?.username || user.email;
    emailSpan.textContent = `Welcome, ${username}`;
    authBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
  } else {
    emailSpan.textContent = '';
    authBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
  }
});

// DOM loaded
document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;

  const emailSpan = document.getElementById('userEmailDisplay');
  const authBtn = document.getElementById('authBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const voteNotice = document.getElementById('voteNotice');

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
    const displayName = profile?.username || user.email;
    emailSpan.textContent = `Welcome, ${displayName}`;
    authBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    if (voteNotice) voteNotice.style.display = 'none';
  } else {
    emailSpan.textContent = '';
    authBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    if (voteNotice) voteNotice.style.display = 'block';
  }

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
      const text = data.join(" &nbsp;&nbsp; • &nbsp;&nbsp; ");
      const repeated = new Array(10).fill(text).join(" &nbsp;&nbsp; • &nbsp;&nbsp; ");
      wrapper.innerHTML = `<div class="ticker-track">${repeated}</div>`;
    });

  try {
    const { data: trends, error } = await supabase
      .from("trends")
      .select("*")
      .order("votes", { ascending: false });

    if (error) {
      console.error("Failed to fetch trends:", error);
      return;
    }

    const grid = document.querySelector(".trending-grid");
    if (!grid) return;

    grid.innerHTML = "";
    const topTrends = trends.slice(0, 5);

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
});
