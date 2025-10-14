-- Insert banner videos
INSERT INTO banner_videos (title, url, order_num) 
VALUES 
  ('Video 1', 'https://drive.google.com/uc?export=download&id=17QJnTZhDii_-lgTG5_7_pIIDSA2pmYGG', 1),
  ('Video 2', 'https://drive.google.com/uc?export=download&id=1oqU3MK7Q7yIAKZBx9At9Na6T1bjUuzky', 2),
  ('Video 3', 'https://drive.google.com/uc?export=download&id=158hHcsivag_dkLpmdSj_oKFWi5X7_l0J', 3)
ON CONFLICT DO NOTHING;