# Video Streaming App with Overlays

A web application to stream RTSP video feeds in real-time and overlay images or text on top of the video. Built with **React**, **Flask**, **HLS.js**, and **FFmpeg**.

## Features

- Real-time video streaming from RTSP sources via FFmpeg
- Overlay images or text on the video
- Drag and reposition overlays on the player
- CRUD operations for overlays through API
- Automatic HLS (.m3u8) playlist generation



## Architecture

### Overview
```

[RTSP Camera/Stream]
│
▼
[Backend (Flask)]
┌─────────────────┐
│ FFmpeg Process │ --> Converts RTSP → HLS (.m3u8)
└─────────────────┘
│
▼
[Public Folder / HLS Stream]
│
▼
[Frontend (React + HLS.js)]
┌───────────────┐
│ Video Player │
│ Overlay Editor│
└───────────────┘
│
▼
[MongoDB]
Stores overlay data (position, type, content)
```

### Component Details

1. **Backend (Flask)**  
   - Handles starting/stopping FFmpeg streams.  
   - Serves HLS files to frontend.  
   - Provides API endpoints for overlay CRUD operations.  
   - Ensures old HLS segments are cleaned up to prevent disk bloat.

2. **FFmpeg**  
   - Converts RTSP streams into HLS (.m3u8 + .ts segments).  
   - Allows for configurable chunk duration (`hls_time`) and playlist size (`hls_list_size`).  
   - Runs asynchronously to avoid blocking the server.

3. **Frontend (React + HLS.js)**  
   - Plays HLS streams in all major browsers.  
   - Overlay editor allows adding, updating, deleting, and repositioning overlays.  
   - Fetches overlay data from backend API.

4. **MongoDB**  
   - Stores overlay metadata: type, content, position, size.  
   - Provides persistence so overlays survive server restarts.

### Design Decisions

- **HLS.js** for playback: Ensures cross-browser support for streaming.  
- **React State Management**: Tracks overlays locally for responsive drag-and-drop editing.  
- **Async FFmpeg**: Prevents blocking API requests while streaming.  
- **Public Folder for HLS Files**: Simplifies serving `.m3u8` and `.ts` segments via the frontend.  
- **MongoDB**: Chosen for flexibility in storing dynamic overlay data.  

---


## Prerequisites

- Node.js >= 18
- Python >= 3.10
- FFmpeg installed (bundled or system-wide)
- MongoDB database

## Installation

### Backend Setup

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
python app.py
```

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. Input your RTSP URL in the frontend form
2. Click "Start Stream" to begin streaming
3. Add overlays using the overlay editor
4. Drag overlays to reposition them
5. Use CRUD controls to manage overlays

## API Documentation

### Base URL
`http://localhost:5000/api`

### Endpoints

#### Stream Control
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/stream/start` | Start stream with RTSP URL |
| POST | `/stream/stop` | Stop current stream |

#### Overlay Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overlays` | Get all overlays |
| POST | `/overlays` | Create new overlay |
| PUT | `/overlays/:id` | Update overlay |
| DELETE | `/overlays/:id` | Delete overlay |

### Overlay Object Structure

```json
{
  "_id": "overlay_id",
  "type": "image | text",
  "content": "image_url_or_text",
  "position": { 
    "x": 0, 
    "y": 0 
  },
  "size": { 
    "width": 100, 
    "height": 50 
  }
}
```

## User Guide

### Starting a Stream
1. Enter RTSP URL in the input field
2. Click "Start Stream"
3. Wait for video playback to begin

### Managing Overlays
- **Add**: Use overlay editor controls
- **Move**: Drag and drop overlays
- **Edit**: Use CRUD controls
- **Delete**: Click delete button on overlay

### Troubleshooting
- Refresh page to reconnect if stream disconnects
- Check console for error messages
- Verify RTSP URL is accessible (or use a free RTSP testing service: https://www.rtsp.stream/admin/teststream)

## License

Copyright © 2025. All Rights Reserved.

This software is proprietary and confidential. No part of this software may be reproduced, distributed, or transmitted in any form or by any means without express written permission from the copyright holder.