const video = document.getElementById("videoPlayer");
const progressText = document.getElementById("progressText");
const userId = "user123";
let watchedIntervals = [];
let startTime = null;
let videoDuration = 0;
const MIN_INTERVAL_SECONDS = 2;
const API_URL = "/api/progress/" + userId;

function mergeIntervals(intervals) {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const prev = merged[merged.length - 1];
    const current = intervals[i];
    if (current[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], current[1]);
    } else {
      merged.push(current);
    }
  }
  return merged;
}

function getTotalWatchedSeconds(intervals) {
  return intervals.reduce((sum, [start, end]) => sum + (end - start), 0);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateProgressDisplay() {
  const merged = mergeIntervals(watchedIntervals);
  const totalWatched = getTotalWatchedSeconds(merged);
  const progress = (totalWatched / videoDuration) * 100;

  // Update Progress %
  progressText.textContent = `${Math.floor(progress)}%`;
  document.getElementById("progressBar").style.width = `${progress}%`;

  // Update Watched Bar
  const watchedBar = document.getElementById("watched-bar");
  watchedBar.style.width = `${progress}%`;

  // Update Time Text
  document.getElementById("time-display").textContent = `Watched: ${formatTime(totalWatched)} / ${formatTime(videoDuration)}`;

  // Update Badge
  let badge = "";
  if (progress >= 90) badge = "🎯 Master Learner!";
  else if (progress >= 50) badge = "📘 Halfway Hero!";
  else if (progress >= 25) badge = "🔥 Rising Star!";
  else badge = "🚀 Getting Started!";
  document.getElementById("badge-display").innerText = `Badge: ${badge}`;

  // Checkmark
  const checkmark = document.getElementById("checkmarkContainer");
  if (progress >= 100) checkmark.classList.remove("hidden");
  else checkmark.classList.add("hidden");
}

function saveProgress() {
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intervals: watchedIntervals, duration: videoDuration }),
  });
}

async function loadProgress() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Could not load progress.");
    const data = await res.json();
    watchedIntervals = data.intervals || [];
    updateProgressDisplay();
  } catch (err) {
    console.error("Failed to load progress:", err);
    watchedIntervals = [];
  }
}

function resetProgress() {
  fetch(API_URL, { method: "DELETE" })
    .then(() => {
      watchedIntervals = [];
      startTime = null;
      video.currentTime = 0;
      updateProgressDisplay();
    })
    .catch((err) => console.error("Error resetting progress:", err));
}

// Event Listeners
video.addEventListener("loadedmetadata", () => {
  videoDuration = Math.floor(video.duration);
  loadProgress();
});

video.addEventListener("play", () => {
  startTime = Math.floor(video.currentTime);
});

video.addEventListener("pause", () => {
  const endTime = Math.floor(video.currentTime);
  if (startTime !== null && endTime > startTime + MIN_INTERVAL_SECONDS) {
    watchedIntervals.push([startTime, endTime]);
    watchedIntervals = mergeIntervals(watchedIntervals);
    saveProgress();
    updateProgressDisplay();
  }
  startTime = null;
});

video.addEventListener("ended", () => {
  if (startTime !== null && videoDuration > startTime + MIN_INTERVAL_SECONDS) {
    watchedIntervals.push([startTime, videoDuration]);
    watchedIntervals = mergeIntervals(watchedIntervals);
    saveProgress();
    updateProgressDisplay();
    startTime = null;
  }
});

document.getElementById("resetBtn").addEventListener("click", resetProgress);
