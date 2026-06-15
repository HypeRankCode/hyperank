export type VoteType = "hype" | "dead";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  avatar_rpm_url: string | null;
  avatar_config: Record<string, string>;
  is_public: boolean;
  credits: number;
  hype_score: number;
  streak_days: number;
  last_voted_at: string | null;
  streak_shield: boolean;
  total_votes: number;
  correct_predictions: number;
  total_predictions: number;
  badge_ids: string[];
  owned_cosmetic_ids: string[];
  social_twitter: string | null;
  social_tiktok: string | null;
  social_instagram: string | null;
  social_youtube: string | null;
  social_twitch: string | null;
  social_verified: Record<string, boolean>;
  is_creator: boolean;
  is_brand: boolean;
  brand_display_name: string | null;
  brand_logo_url: string | null;
  brand_website: string | null;
  is_banned: boolean;
  is_muted: boolean;
  is_minor: boolean;
  age_verified: boolean;
  parental_consent_given: boolean;
  created_at: string;
}

export interface Trend {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  tags: string[];
  hype_votes: number;
  dead_votes: number;
  vote_velocity: number;
  hype_score: number;
  is_daily_drop: boolean;
  daily_drop_date: string | null;
  is_sponsored: boolean;
  sponsor_label: string | null;
  sponsor_cta_url: string | null;
  sponsor_cta_label: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
}
