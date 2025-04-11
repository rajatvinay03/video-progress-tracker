const video = document.getElementById("videoPlayer");
const progressText = document.getElementById("progressText");
const userId = "user123"; // Static for demo
let watchedIntervals = [];
let startTime = null;
let videoDuration = 0;
let isResetting = false;

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

function updateWatchedBar(intervals, duration) {
  if (!duration || duration === 0) {
    console.warn("Duration is zero, cannot update watched bar.");
    return;
  }

  const merged = mergeIntervals(intervals);
  let uniqueTime = 0;
  merged.forEach(([start, end]) => {
    uniqueTime += end - start;
  });

  const percentage = (uniqueTime / duration) * 100;
  document.getElementById('watched-bar').style.width = `${percentage}%`;

  console.log("Watched:", uniqueTime, "Duration:", duration, "Percent:", percentage);
}

function updateTimeDisplay(intervals, duration) {
  let totalWatched = getTotalWatchedSeconds(intervals);
  const display = document.getElementById('time-display');
  display.innerText = `Watched: ${formatTime(totalWatched)} / ${formatTime(duration)}`;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function showBadge(progress) {
  let badge = '';
  if (progress >= 90) badge = '🎯 Master Learner!';
  else if (progress >= 50) badge = '📘 Halfway Hero!';
  else if (progress >= 25) badge = '🔥 Rising Star!';
  else badge = '🚀 Getting Started!';

  document.getElementById("badge-display").innerText = `Badge: ${badge}`;
}

function updateProgressDisplay() {
  const merged = mergeIntervals(watchedIntervals);
  const totalWatched = getTotalWatchedSeconds(merged);
  const progress = (totalWatched / videoDuration) * 100;

  const progressBar = document.getElementById("progressBar");
  progressBar.style.width = `${progress}%`;

  // Smooth animate the percentage
  let start = parseFloat(progressText.textContent) || 0;
  let end = progress;
  let step = (end - start) / 20;
  let count = 0;

  const animate = () => {
    if (count >= 20) return;
    start += step;
    progressText.textContent = `${start.toFixed(0)}%`;
    count++;
    requestAnimationFrame(animate);
  };
  animate();

  updateTimeDisplay(merged, videoDuration);

  const checkmark = document.getElementById("checkmarkContainer");
  if (progress >= 100) {
    checkmark.classList.remove("hidden");
  } else {
    checkmark.classList.add("hidden");
  }

  updateWatchedBar(merged, videoDuration);
  showBadge(progress);
}

video.addEventListener("play", () => {
  startTime = Math.floor(video.currentTime);
});

video.addEventListener("pause", () => {
  const endTime = Math.floor(video.currentTime);
  if (startTime !== null && endTime > startTime) {
    watchedIntervals.push([startTime, endTime]);
    watchedIntervals = mergeIntervals(watchedIntervals);
    saveProgress();
    updateProgressDisplay();
    startTime = null;
  }
});

video.addEventListener("ended", () => {
  saveProgress();
});

video.addEventListener("timeupdate", () => {
  if (isResetting) return;

  if (startTime === null) startTime = Math.floor(video.currentTime);

  const current = Math.floor(video.currentTime);
  const last = watchedIntervals.at(-1);

  if (!last || current > last[1]) {
    watchedIntervals.push([current, current + 1]);
    watchedIntervals = mergeIntervals(watchedIntervals);
  }

  updateProgressDisplay();
});

function saveProgress() {
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intervals: watchedIntervals, duration: videoDuration })
  });
}

async function loadProgress() {
  watchedIntervals = [];
  video.currentTime = 0;
  progressText.textContent = "0%";
  document.getElementById("progressBar").style.width = "0%";
  document.getElementById("time-display").textContent = "Watched: 00:00 / 00:00";
  document.getElementById("checkmarkContainer").classList.add("hidden");
  document.getElementById("badge-display").innerText = "";
  updateProgressDisplay();
}

video.addEventListener("loadedmetadata", () => {
  videoDuration = Math.floor(video.duration);
  loadProgress();
  console.log("Loaded Metadata → Duration:", videoDuration);
});

function resetProgress() {
  isResetting = true;

  fetch(API_URL, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Reset successful:", data);
      watchedIntervals = [];
      video.currentTime = 0;
      progressText.textContent = "0%";
      document.getElementById("progressBar").style.width = "0%";
      document.getElementById("watched-bar").style.width = "0%";
      document.getElementById("checkmarkContainer").classList.add("hidden");
      document.getElementById("badge-display").innerText = "";
      updateTimeDisplay([], videoDuration);
      updateWatchedBar([], videoDuration);

      setTimeout(() => {
        isResetting = false;
      }, 500);
    })
    .catch((err) => {
      console.error("Error resetting progress:", err);
      isResetting = false;
    });
}

document.getElementById("resetBtn").addEventListener("click", resetProgress);
