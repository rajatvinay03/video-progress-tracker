const video = document.getElementById("videoPlayer");
const progressText = document.getElementById("progressText");
const userId = "user123"; // Static for demo
let watchedIntervals = [];
let startTime = null;
let videoDuration = 0;

const API_URL = "/api/progress/" + userId;
const MIN_INTERVAL = 2;

// Merge overlapping intervals
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

// Get total watched seconds
function getTotalWatchedSeconds(intervals) {
  return intervals.reduce((sum, [start, end]) => sum + (end - start), 0);
}

// Update visual bar showing watched segments
function updateWatchedBar(intervals, duration) {
  if (!duration) return;

  const merged = mergeIntervals(intervals);
  let uniqueTime = 0;
  merged.forEach(([start, end]) => uniqueTime += end - start);

  const percentage = (uniqueTime / duration) * 100;
  document.getElementById('watched-bar').style.width = `${percentage}%`;
}

// Update time display
function updateTimeDisplay(intervals, duration) {
  const totalWatched = getTotalWatchedSeconds(intervals);
  const display = document.getElementById('time-display');
  display.innerText = `Watched: ${formatTime(totalWatched)} / ${formatTime(duration)}`;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Show badge
function showBadge(progress) {
  if (isNaN(progress)) return;

  let badge = '';
  if (progress >= 90) badge = '🎯 Master Learner!';
  else if (progress >= 50) badge = '📘 Halfway Hero!';
  else if (progress >= 25) badge = '🔥 Rising Star!';
  else badge = '🚀 Getting Started!';

  document.getElementById("badge-display").innerText = `Badge: ${badge}`;
}

// Update progress bar and info
function updateProgressDisplay() {
  const merged = mergeIntervals(watchedIntervals);
  const totalWatched = getTotalWatchedSeconds(merged);
  const safeDuration = videoDuration || video.duration || 1;
  const progress = (totalWatched / safeDuration) * 100;

  const progressBar = document.getElementById("progressBar");
  progressBar.style.width = `${progress}%`;

  // Smooth animate percentage
  let currentText = parseFloat(progressText.textContent) || 0;
  let end = progress;
  let step = (end - currentText) / 20;
  let count = 0;

  const animate = () => {
    if (count >= 20) return;
    currentText += step;
    progressText.textContent = `${Math.min(currentText, 100).toFixed(0)}%`;
    count++;
    requestAnimationFrame(animate);
  };
  animate();

  updateTimeDisplay(merged, safeDuration);

  const checkmark = document.getElementById("checkmarkContainer");
  checkmark.classList.toggle("hidden", progress < 99.5);

  updateWatchedBar(merged, safeDuration);
  showBadge(progress);
}

// On play, mark start time
video.addEventListener("play", () => {
  startTime = Math.floor(video.currentTime);
});

// On pause, record interval
video.addEventListener("pause", () => {
  const endTime = Math.floor(video.currentTime);
  if (startTime !== null && (endTime - startTime >= MIN_INTERVAL)) {
    watchedIntervals.push([startTime, endTime]);
    watchedIntervals = mergeIntervals(watchedIntervals);
    saveProgress();
    updateProgressDisplay();
  }
  startTime = null;
});

// Only update display on timeupdate
video.addEventListener("timeupdate", () => {
  updateProgressDisplay();
});

// Save when video ends
video.addEventListener("ended", () => {
  saveProgress();
});

// Save progress
function saveProgress() {
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      intervals: watchedIntervals,
      duration: videoDuration,
      lastPosition: Math.floor(video.currentTime),
    }),
  });
}

// Load progress from server
async function loadProgress() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to load saved progress");

    const data = await res.json();
    watchedIntervals = data.intervals || [];
    video.currentTime = data.lastPosition || 0;
    updateProgressDisplay();
  } catch (err) {
    console.error("Error loading progress:", err);
    watchedIntervals = [];
    video.currentTime = 0;
    updateProgressDisplay();
  }
}

// On metadata loaded, get duration and load saved progress
video.addEventListener("loadedmetadata", () => {
  videoDuration = Math.floor(video.duration);
  loadProgress();
});

// Reset progress
function resetProgress() {
  fetch(API_URL, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Reset failed");
      watchedIntervals = [];
      startTime = null;
      video.currentTime = 0;
      progressText.textContent = "0%";
      document.getElementById("progressBar").style.width = "0%";
      document.getElementById("watched-bar").style.width = "0%";
      document.getElementById("checkmarkContainer").classList.add("hidden");
      document.getElementById("badge-display").innerText = "";
      updateTimeDisplay([], videoDuration);
      updateWatchedBar([], videoDuration);
    })
    .catch((err) => console.error("Error resetting progress:", err));
}

document.getElementById("resetBtn").addEventListener("click", resetProgress);
