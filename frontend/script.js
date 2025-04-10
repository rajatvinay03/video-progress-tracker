const video = document.getElementById("videoPlayer");
const progressText = document.getElementById("progressText");
const userId = "user123"; // Static for demo
let watchedIntervals = [];
let startTime = null;
let videoDuration = 0;

const API_URL = "http://localhost:3000/api/progress/" + userId;

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

function updateProgressDisplay() {
  const merged = mergeIntervals(watchedIntervals);
  const totalWatched = getTotalWatchedSeconds(merged);
  const progress = ((totalWatched / videoDuration) * 100).toFixed(2);
  progressText.textContent = `${progress}%`;
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

function saveProgress() {
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intervals: watchedIntervals, duration: videoDuration })
  });
}

async function loadProgress() {
  const res = await fetch(API_URL);
  const data = await res.json();
  watchedIntervals = data.intervals || [];
  video.currentTime = watchedIntervals.length ? watchedIntervals[watchedIntervals.length - 1][1] : 0;
  updateProgressDisplay();
}

video.addEventListener("loadedmetadata", () => {
  videoDuration = Math.floor(video.duration);
  loadProgress();
});
