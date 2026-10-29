-- Seeds for public.destinations table (Milestone 2)
-- Run after backend/database/schema.sql in Supabase SQL Editor

insert into public.destinations (slug, name, country, region, summary, tags, budget_level, min_days, max_days, vibe_scores)
values ('kyoto', 'Kyoto', 'Japan', 'Kansai', 'Temples, tea houses, and quiet lanes that reward a slower, detail-loving traveler.', ARRAY['culture', 'food', 'wellness', 'romance']::text[], 'moderate', 3, 8, '{"culture":0.98,"food":0.9,"wellness":0.86,"romance":0.8,"nature":0.55,"adventure":0.25,"nightlife":0.2,"family":0.6}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  tags = excluded.tags,
  budget_level = excluded.budget_level,
  min_days = excluded.min_days,
  max_days = excluded.max_days,
  vibe_scores = excluded.vibe_scores;

insert into public.destinations (slug, name, country, region, summary, tags, budget_level, min_days, max_days, vibe_scores)
values ('lisbon', 'Lisbon', 'Portugal', 'Lisboa', 'Sun-washed hills, tiled facades, and a food scene that stretches from tinned fish to late-night fado.', ARRAY['food', 'culture', 'nightlife', 'romance']::text[], 'budget', 3, 7, '{"food":0.94,"culture":0.82,"nightlife":0.78,"romance":0.84,"adventure":0.4,"wellness":0.35,"nature":0.45,"family":0.62}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  tags = excluded.tags,
  budget_level = excluded.budget_level,
  min_days = excluded.min_days,
  max_days = excluded.max_days,
  vibe_scores = excluded.vibe_scores;

insert into public.destinations (slug, name, country, region, summary, tags, budget_level, min_days, max_days, vibe_scores)
values ('bali', 'Ubud & Bali', 'Indonesia', 'Bali', 'Rice terraces, temple offerings, and a wellness rhythm that can be as quiet or social as you want.', ARRAY['wellness', 'nature', 'food', 'romance']::text[], 'budget', 4, 12, '{"wellness":0.96,"nature":0.92,"food":0.8,"romance":0.86,"culture":0.7,"adventure":0.55,"nightlife":0.45,"family":0.58}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  tags = excluded.tags,
  budget_level = excluded.budget_level,
  min_days = excluded.min_days,
  max_days = excluded.max_days,
  vibe_scores = excluded.vibe_scores;

insert into public.destinations (slug, name, country, region, summary, tags, budget_level, min_days, max_days, vibe_scores)
values ('reykjavik', 'Reykjavík & South Coast', 'Iceland', 'Capital & South', 'Lava fields, waterfalls, and long golden hours — built for people who like weather as a character.', ARRAY['nature', 'adventure', 'wellness', 'romance']::text[], 'luxury', 4, 10, '{"nature":0.99,"adventure":0.9,"wellness":0.74,"romance":0.7,"culture":0.45,"food":0.5,"nightlife":0.35,"family":0.55}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  tags = excluded.tags,
  budget_level = excluded.budget_level,
  min_days = excluded.min_days,
  max_days = excluded.max_days,
  vibe_scores = excluded.vibe_scores;

insert into public.destinations (slug, name, country, region, summary, tags, budget_level, min_days, max_days, vibe_scores)
values ('marrakech', 'Marrakech', 'Morocco', 'Marrakesh-Safi', 'Riads, spice souks, and rooftop evenings — intense in the best way if you like sensory travel.', ARRAY['culture', 'food', 'adventure', 'romance']::text[], 'budget', 3, 7, '{"culture":0.95,"food":0.9,"adventure":0.7,"romance":0.78,"nightlife":0.4,"wellness":0.5,"nature":0.45,"family":0.5}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  tags = excluded.tags,
  budget_level = excluded.budget_level,
  min_days = excluded.min_days,
  max_days = excluded.max_days,
  vibe_scores = excluded.vibe_scores;

insert into public.destinations (slug, name, country, region, summary, tags, budget_level, min_days, max_days, vibe_scores)
values ('queenstown', 'Queenstown', 'New Zealand', 'Otago', 'Alpine water, trailheads, and a town that treats adrenaline as a daily menu item.', ARRAY['adventure', 'nature', 'romance', 'food']::text[], 'luxury', 4, 10, '{"adventure":0.99,"nature":0.96,"romance":0.72,"food":0.62,"wellness":0.4,"culture":0.3,"nightlife":0.5,"family":0.6}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  tags = excluded.tags,
  budget_level = excluded.budget_level,
  min_days = excluded.min_days,
  max_days = excluded.max_days,
  vibe_scores = excluded.vibe_scores;

insert into public.destinations (slug, name, country, region, summary, tags, budget_level, min_days, max_days, vibe_scores)
values ('barcelona', 'Barcelona', 'Spain', 'Catalonia', 'Architecture you can wander through, neighborhood tapas, and a Mediterranean late-night clock.', ARRAY['culture', 'food', 'nightlife', 'family']::text[], 'moderate', 3, 8, '{"culture":0.9,"food":0.92,"nightlife":0.88,"family":0.7,"romance":0.75,"adventure":0.35,"wellness":0.3,"nature":0.4}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  tags = excluded.tags,
  budget_level = excluded.budget_level,
  min_days = excluded.min_days,
  max_days = excluded.max_days,
  vibe_scores = excluded.vibe_scores;

insert into public.destinations (slug, name, country, region, summary, tags, budget_level, min_days, max_days, vibe_scores)
values ('mexico-city', 'Mexico City', 'Mexico', 'CDMX', 'Museums, markets, and one of the world''s great eating cities — layered, walkable, endlessly curious.', ARRAY['food', 'culture', 'nightlife', 'family']::text[], 'budget', 4, 9, '{"food":0.99,"culture":0.93,"nightlife":0.8,"family":0.65,"adventure":0.4,"romance":0.68,"wellness":0.35,"nature":0.3}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  tags = excluded.tags,
  budget_level = excluded.budget_level,
  min_days = excluded.min_days,
  max_days = excluded.max_days,
  vibe_scores = excluded.vibe_scores;

insert into public.destinations (slug, name, country, region, summary, tags, budget_level, min_days, max_days, vibe_scores)
values ('amalfi', 'Amalfi Coast', 'Italy', 'Campania', 'Cliffside villages, lemon groves, and ferry hops for travelers who want beauty more than efficiency.', ARRAY['romance', 'food', 'nature', 'wellness']::text[], 'luxury', 4, 8, '{"romance":0.98,"food":0.88,"nature":0.8,"wellness":0.7,"culture":0.6,"adventure":0.35,"nightlife":0.35,"family":0.55}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  tags = excluded.tags,
  budget_level = excluded.budget_level,
  min_days = excluded.min_days,
  max_days = excluded.max_days,
  vibe_scores = excluded.vibe_scores;

insert into public.destinations (slug, name, country, region, summary, tags, budget_level, min_days, max_days, vibe_scores)
values ('cape-town', 'Cape Town', 'South Africa', 'Western Cape', 'Mountain, ocean, and vineyard in one compact radius — high variety for mixed-vibe groups.', ARRAY['nature', 'adventure', 'food', 'family']::text[], 'moderate', 4, 10, '{"nature":0.94,"adventure":0.86,"food":0.8,"family":0.72,"culture":0.65,"romance":0.74,"nightlife":0.55,"wellness":0.5}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  tags = excluded.tags,
  budget_level = excluded.budget_level,
  min_days = excluded.min_days,
  max_days = excluded.max_days,
  vibe_scores = excluded.vibe_scores;

insert into public.destinations (slug, name, country, region, summary, tags, budget_level, min_days, max_days, vibe_scores)
values ('chiang-mai', 'Chiang Mai', 'Thailand', 'North', 'Temples, night markets, and mountain day trips — easy on the budget, rich on atmosphere.', ARRAY['food', 'culture', 'wellness', 'adventure']::text[], 'budget', 3, 9, '{"food":0.9,"culture":0.88,"wellness":0.72,"adventure":0.6,"nature":0.65,"nightlife":0.5,"romance":0.55,"family":0.6}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  tags = excluded.tags,
  budget_level = excluded.budget_level,
  min_days = excluded.min_days,
  max_days = excluded.max_days,
  vibe_scores = excluded.vibe_scores;

insert into public.destinations (slug, name, country, region, summary, tags, budget_level, min_days, max_days, vibe_scores)
values ('banff', 'Banff & Lake Louise', 'Canada', 'Alberta', 'Turquoise lakes and trail days for people who want the outdoors to be the itinerary, not a side quest.', ARRAY['nature', 'adventure', 'family', 'romance']::text[], 'luxury', 3, 8, '{"nature":0.99,"adventure":0.88,"family":0.78,"romance":0.8,"wellness":0.5,"food":0.45,"culture":0.25,"nightlife":0.2}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  tags = excluded.tags,
  budget_level = excluded.budget_level,
  min_days = excluded.min_days,
  max_days = excluded.max_days,
  vibe_scores = excluded.vibe_scores;
