-- Empathon Autos — Seed Data
-- Run this after 001_schema.sql to populate default content blocks.
-- Sections on the Home, About, and Corporate pages will appear immediately.

-- Home page — Trusted Clients (shown as logo strip)
INSERT INTO content_blocks (page_key, title, body) VALUES
('home', 'clients', '[{"name": "Radisson Blu Hotel"}, {"name": "Johnvents Group"}, {"name": "Dangote Industries"}, {"name": "MTN Nigeria"}, {"name": "Access Bank"}]')
ON CONFLICT (page_key, title) DO NOTHING;

-- About page — Leadership team
INSERT INTO content_blocks (page_key, title, body) VALUES
('about', 'leadership', '[{"name": "Chinwe Okafor", "role": "Managing Director"}, {"name": "Tunde Balogun", "role": "Head of Operations"}, {"name": "Amara Obi", "role": "Finance Director"}, {"name": "Femi Adeleke", "role": "Sales & Marketing Lead"}]')
ON CONFLICT (page_key, title) DO NOTHING;

-- Corporate page — Corporate clients
INSERT INTO content_blocks (page_key, title, body) VALUES
('corporate', 'clients', '[{"name": "Radisson Blu Hotel", "desc": "Fleet partner since 2021"}, {"name": "Johnvents Group", "desc": "Corporate account"}, {"name": "Dangote Industries", "desc": "Executive fleet provider"}]')
ON CONFLICT (page_key, title) DO NOTHING;
