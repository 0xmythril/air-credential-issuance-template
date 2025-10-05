export interface LinkedInUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  // Additional profile data
  headline?: string;
  location?: string;
  connections?: number;
  position?: string;
  company?: string;
}

export interface LinkedInProfileData {
  linkedin_id: string;
  name: string;
  email: string;
  headline?: string;
  location?: string;
  connections?: number;
  position?: string;
  company?: string;
  profile_url?: string;
  user_type: "linkedin";
}

