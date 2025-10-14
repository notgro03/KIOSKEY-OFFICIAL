import { supabase } from '../src/config/supabase.js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

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
  const buffer = await response.buffer();
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
  for (const video of videos) {
    try {
      console.log(`Downloading ${video.name}...`);
      const tempPath = await downloadVideo(video.url, video.name);
      
      console.log(`Uploading ${video.name} to Supabase...`);
      const publicUrl = await uploadToSupabase(tempPath, video.name);
      
      console.log(`Inserting ${video.name} into banner_videos...`);
      const { error } = await supabase
        .from('banner_videos')
        .insert([{
          title: video.name,
          url: publicUrl,
          order_num: videos.indexOf(video) + 1
        }]);

      if (error) throw error;

      // Cleanup temp file
      await fs.promises.unlink(tempPath);
      console.log(`Successfully processed ${video.name}`);
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