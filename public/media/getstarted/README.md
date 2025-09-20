# GetStartedView Media Assets

This directory contains media assets specifically for the GetStartedView component.

## Organization
- All assets for the GetStartedView component are contained in this directory
- Easy to remove the entire feature by deleting the GetStartedView component folder and this media directory

## Usage
Place your images and videos here:
- `hero-image.jpg` - Main hero image
- `demo-video.mp4` - Demo video  
- `poster.jpg` - Video poster image
- `fallback-image.jpg` - Fallback image

## Supported Formats

### Images
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`

### Videos
- `.mp4`, `.webm`, `.ogg`, `.mov`, `.avi`

## Accessing in Code
Use the media utility functions in the GetStartedView component:
```tsx
import { getMediaAsset } from "../utils/media";

<MediaDisplay src={getMediaAsset("heroImage")} />
```
