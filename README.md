# Video Progress Tracker

## Overview
Tracks unique intervals a user watches in a video and shows real progress, not just whether it played till the end.

## Features
- Tracks and stores only unique watched segments
- Prevents progress from rewatching or skipping
- Saves and resumes progress with backend support

## Tech Stack
- HTML, CSS, JavaScript
- Node.js, Express

## Setup
1. Clone the repo
2. Run backend server:node backend/server.js
3. Open `frontend/index.html` in browser

## Design Decisions
- Merging intervals avoids double counting
- Simple JSON-based backend for easy setup
- Extensible to multi-user and database later

## Challenges
- Handling video event edge cases
- Ensuring persistence and clean interval merging

