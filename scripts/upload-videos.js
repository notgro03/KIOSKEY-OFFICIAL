import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build a Supabase client for Node scripts using process.env.
// Set SUPABASE_URL and SUPABASE_KEY (service_role or anon) in your environment before running.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment. Export them before running this script.');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const videos = [
  {
    url: 'https://drive.google.com/uc?export=download&id=17QJnTZhDii_-lgTG5_7_pIIDSA2pmYGG',
    name: 'banner-video-1.mp4'
  },
  {
    url: 'https://drive.google.com/uc?export=download&id=1oqU3MK7Q7yIAKZBx9At9Na6T1bjUuzky',
    name: 'banner-video-2.mp4'
  },
  {
    url: 'https://drive.google.com/uc?export=download&id=158hHcsivag_dkLpmdSj_oKFWi5X7_l0J',
    name: 'banner-video-3.mp4'
  }
];

async function downloadVideo(url, fileName) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tempPath = path.join(__dirname, fileName);
  await fs.promises.writeFile(tempPath, buffer);
  return tempPath;
}

async function uploadToSupabase(filePath, fileName) {
  const file = await fs.promises.readFile(filePath);
  const { data, error } = await supabase.storage
    .from('videos')
    .upload(`banner/${fileName}`, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('videos')
    .getPublicUrl(`banner/${fileName}`);

  return publicUrl;
}

async function uploadVideos() {
  const targetTable = process.env.TARGET_TABLE || 'banner_videos';
  for (const video of videos) {
    try {
      console.log(`Downloading ${video.name}...`);
      // Determine source: if the provided URL already points to Supabase storage public object,
      // skip downloading and uploading and use it directly. Otherwise download and upload.
      let publicUrl;
      const sourceUrl = video.url || video.video_url;
      const looksLikeSupabaseStorage = typeof sourceUrl === 'string' && sourceUrl.includes('/storage/v1/object');
      if (looksLikeSupabaseStorage) {
        console.log(`Using existing storage URL for ${video.name || video.title}`);
        publicUrl = sourceUrl;
      } else {
        const tempPath = await downloadVideo(sourceUrl, video.name || (`video-${Date.now()}`));
        console.log(`Uploading ${video.name || video.title} to Supabase...`);
        publicUrl = await uploadToSupabase(tempPath, video.name || path.basename(tempPath));
        // Cleanup temp file
        try {
          await fs.promises.unlink(tempPath);
        } catch (err) {
          console.warn(`Failed to remove temp file ${tempPath}:`, err.message);
        }
      }
      
      console.log(`Inserting ${video.name || video.title} into ${targetTable}...`);
      // Prepare payload depending on target table conventions
      let payload;
      if (targetTable === 'video_gift') {
        // Accept either explicit id/title/video_url/order_index or fallback
        payload = {
          // include id if provided in the video object
          ...(video.id ? { id: video.id } : {}),
          title: video.title || video.name || `video-${videos.indexOf(video)+1}`,
          video_url: publicUrl,
          order_index: video.order_index || videos.indexOf(video) + 1
        };
      } else {
        // default: banner_videos
        payload = {
          title: video.title || video.name || `video-${videos.indexOf(video)+1}`,
          url: publicUrl,
          order_num: video.order_num || video.order_index || videos.indexOf(video) + 1
        };
      }

      const { error } = await supabase
        .from(targetTable)
        .insert([payload]);
      if (error) throw error;

      console.log(`Successfully processed ${video.name}`);
      // Cleanup temp file
      try {
        await fs.promises.unlink(tempPath);
      } catch (err) {
        console.warn(`Failed to remove temp file ${tempPath}:`, err.message);
      }
    } catch (error) {
      console.error(`Error processing ${video.name}:`, error);
    }
  }
}

uploadVideos().then(() => {
  console.log('All videos processed');
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});