export interface VotePayload {
  city: string;
  vote: boolean;
}

export interface ResultsResponse {
  city: string;
  vote_date: string;
  yes_count: number;
  no_count: number;
  total_votes: number;
  yes_percent: number;
  no_percent: number;
  user_voted: boolean;
  user_vote: boolean | null;
  resets_at: string;
}

export interface HealthResponse {
  status: string;
}

export interface ApiError {
  error: string;
  code: string;
}
