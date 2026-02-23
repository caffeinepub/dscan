# Specification

## Summary
**Goal:** Add the ability to import document images from local files in addition to camera capture.

**Planned changes:**
- Add a file input component on the ScanPage that allows users to select image files (JPEG, PNG, WebP) from their device
- Process locally imported images through the same workflow as camera-captured images, including ImageEditor for corner detection and perspective correction
- Update ScanPage state management to support both camera capture and file import as entry points
- Display UI affordances that make the file import option discoverable alongside the camera capture interface

**User-visible outcome:** Users can add documents to DSCAN by either capturing with their camera or selecting existing image files from their device, with both methods using the same editing and enhancement workflow.
