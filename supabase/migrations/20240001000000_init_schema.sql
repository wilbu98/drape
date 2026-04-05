-- ============================================================
-- DRAPE — Initial Schema Migration
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location_city TEXT,
  location_lat DECIMAL,
  location_lng DECIMAL,
  style_preferences TEXT[] DEFAULT '{}',
  activity_defaults TEXT[] DEFAULT '{}',
  push_token TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wardrobe Items
CREATE TABLE public.wardrobe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  colors TEXT[] DEFAULT '{}',
  brand TEXT,
  photo_url TEXT,
  purchase_url TEXT,
  tags TEXT[] DEFAULT '{}',
  last_worn_at TIMESTAMPTZ,
  times_worn INTEGER DEFAULT 0,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Outfits
CREATE TABLE public.generated_outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_ids UUID[] DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  weather_temp INTEGER,
  weather_condition TEXT,
  activity_type TEXT,
  accepted BOOLEAN DEFAULT false,
  worn BOOLEAN DEFAULT false
);

-- Outfit Posts
CREATE TABLE public.outfit_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  activity_context TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Item Tags
CREATE TABLE public.post_item_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.outfit_posts(id) ON DELETE CASCADE NOT NULL,
  wardrobe_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  item_name TEXT,
  source_url TEXT,
  x_pos DECIMAL,
  y_pos DECIMAL
);

-- Follows
CREATE TABLE public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Saved Posts
CREATE TABLE public.saved_posts (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.outfit_posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Wishlist
CREATE TABLE public.wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  source_post_id UUID REFERENCES public.outfit_posts(id) ON DELETE SET NULL,
  item_name TEXT,
  source_url TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Likes
CREATE TABLE public.post_likes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.outfit_posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Post Comments
CREATE TABLE public.post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.outfit_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_wardrobe_items_user_id ON public.wardrobe_items(user_id);
CREATE INDEX idx_wardrobe_items_category ON public.wardrobe_items(category);
CREATE INDEX idx_generated_outfits_user_id ON public.generated_outfits(user_id);
CREATE INDEX idx_generated_outfits_generated_at ON public.generated_outfits(generated_at DESC);
CREATE INDEX idx_outfit_posts_user_id ON public.outfit_posts(user_id);
CREATE INDEX idx_outfit_posts_created_at ON public.outfit_posts(created_at DESC);
CREATE INDEX idx_outfit_posts_visibility ON public.outfit_posts(visibility);
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- AUTO-UPDATE LIKES COUNT
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_like_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.outfit_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_like_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.outfit_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_like_insert AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_like_insert();

CREATE TRIGGER on_like_delete AFTER DELETE ON public.post_likes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_like_delete();

-- AUTO-UPDATE COMMENTS COUNT
CREATE OR REPLACE FUNCTION public.handle_comment_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.outfit_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_comment_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.outfit_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_comment_insert AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_comment_insert();

CREATE TRIGGER on_comment_delete AFTER DELETE ON public.post_comments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_comment_delete();

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- WARDROBE ITEMS
CREATE POLICY "Users can view their own wardrobe"
  ON public.wardrobe_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wardrobe items"
  ON public.wardrobe_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobe items"
  ON public.wardrobe_items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wardrobe items"
  ON public.wardrobe_items FOR DELETE USING (auth.uid() = user_id);

-- GENERATED OUTFITS
CREATE POLICY "Users can view their own outfits"
  ON public.generated_outfits FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outfits"
  ON public.generated_outfits FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfits"
  ON public.generated_outfits FOR UPDATE USING (auth.uid() = user_id);

-- OUTFIT POSTS
CREATE POLICY "Public posts are viewable by everyone"
  ON public.outfit_posts FOR SELECT USING (
    visibility = 'public'
    OR auth.uid() = user_id
    OR (
      visibility = 'friends'
      AND EXISTS (
        SELECT 1 FROM public.follows
        WHERE follower_id = auth.uid() AND following_id = user_id
      )
    )
  );

CREATE POLICY "Users can insert their own posts"
  ON public.outfit_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.outfit_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.outfit_posts FOR DELETE USING (auth.uid() = user_id);

-- POST ITEM TAGS
CREATE POLICY "Post item tags viewable with post"
  ON public.post_item_tags FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.outfit_posts
      WHERE id = post_id
      AND (visibility = 'public' OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage tags on their own posts"
  ON public.post_item_tags FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.outfit_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- FOLLOWS
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- SAVED POSTS
CREATE POLICY "Users can view their own saved posts"
  ON public.saved_posts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
  ON public.saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts"
  ON public.saved_posts FOR DELETE USING (auth.uid() = user_id);

-- WISHLIST
CREATE POLICY "Users can view their own wishlist"
  ON public.wishlist_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to wishlist"
  ON public.wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from wishlist"
  ON public.wishlist_items FOR DELETE USING (auth.uid() = user_id);

-- POST LIKES
CREATE POLICY "Likes are viewable by everyone"
  ON public.post_likes FOR SELECT USING (true);

CREATE POLICY "Users can like posts"
  ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- POST COMMENTS
CREATE POLICY "Comments are viewable by everyone"
  ON public.post_comments FOR SELECT USING (true);

CREATE POLICY "Users can comment"
  ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('wardrobe', 'wardrobe', false),
  ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Post images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Users can upload post images"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can access their own wardrobe images"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'wardrobe' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload wardrobe images"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'wardrobe' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own wardrobe images"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'wardrobe' AND auth.uid()::text = (storage.foldername(name))[1]
  );
