import { inngestClient } from "../config/inngest.js";

export const processGameHighlightsVideo = inngestClient.createFunction(
  { id: "process-highlights-video" },
  { event: "process-highlights-video" },
  async ({ step }) => {}
);

async function processVideo() {
  // get highlights videos sorted by processed_video_url in asc order
  // check if a video is already in process
  // store current processing highlight in cache
  // process video
}
