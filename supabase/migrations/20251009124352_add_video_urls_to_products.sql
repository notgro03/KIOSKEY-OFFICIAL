/*
  # Add Video URLs to Product Tables

  1. Changes
    - Add `video_url` column to `products` table for category product cards
    - Add `video_url` column to `telemandos` table for individual telemando products
    - Add `video_url` column to `llaves` table for individual llave products
    - Add `video_url` column to `carcasas` table for individual carcasa products
    
  2. Purpose
    - Allow admin to add video/gif URLs to enhance product presentation
    - Videos will be displayed on product cards and detail pages
    - Provides better visual representation of products
    
  3. Notes
    - All video_url fields are optional (nullable)
    - Default value is empty string for consistency
    - Can store URLs to MP4 videos, GIFs, or other video formats
*/

-- Add video_url to products table (main category cards)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE products ADD COLUMN video_url text DEFAULT '';
  END IF;
END $$;

-- Add video_url to telemandos table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'telemandos' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE telemandos ADD COLUMN video_url text DEFAULT '';
  END IF;
END $$;

-- Add video_url to llaves table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'llaves' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE llaves ADD COLUMN video_url text DEFAULT '';
  END IF;
END $$;

-- Add video_url to carcasas table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carcasas' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE carcasas ADD COLUMN video_url text DEFAULT '';
  END IF;
END $$;
