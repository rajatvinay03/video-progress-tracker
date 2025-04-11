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
    let totalWatched = 0;
    intervals.forEach(([start, end]) => totalWatched += end - start);
    const display = document.getElementById('time-display');
    display.innerText = `Watched: ${formatTime(totalWatched)} / ${formatTime(duration)}`;
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
  
    const progressText = document.getElementById("progressText");
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
      progressText.textContent = `Progress: ${start.toFixed(0)}%`;
      count++;
      requestAnimationFrame(animate);
    };
    animate();
  
    updateTimeDisplay(merged, videoDuration);
  
    // Show checkmark if completed
    const checkmark = document.getElementById("checkmarkContainer");
    if (progress >= 100) {
      checkmark.classList.remove("hidden");
    } else {
      checkmark.classList.add("hidden");
    }

    updateWatchedBar(merged, videoDuration);
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
    // console.log("Saving progress:", watchedIntervals, "with duration:", videoDuration);
  
});
}

async function loadProgress() {
  const res = await fetch(API_URL);
  const data = await res.json();
  watchedIntervals = data.intervals || [];
  console.log("Loaded Progress:", watchedIntervals, "Duration:", videoDuration);
  video.currentTime = watchedIntervals.length ? watchedIntervals[watchedIntervals.length - 1][1] : 0;
  updateProgressDisplay();
}

video.addEventListener("loadedmetadata", () => {
  videoDuration = Math.floor(video.duration);
  loadProgress();
  console.log("Loaded Metadata → Duration:", videoDuration);});

  function resetProgress() {
    fetch(API_URL, { method: "DELETE" })
      .then(res => res.json())
      .then(data => {
        console.log(data.message || "Progress reset");
        watchedIntervals = [];
        video.currentTime = 0;
        updateProgressDisplay();
      })
      .catch(err => console.error("Error resetting progress:", err));
  }
  document.getElementById("resetBtn").addEventListener("click", resetProgress);

  function resetProgress() {
    fetch(API_URL, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Reset successful:", data);
        watchedIntervals = [];
        progressText.textContent = "0%";
        document.getElementById("progressBar").style.width = "0%";
        document.getElementById("watched-bar").style.width = "0%";
        video.currentTime = 0;
      })
      .catch((err) => console.error("Error resetting progress:", err));
  }