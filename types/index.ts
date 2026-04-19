export type District = {
  id: string
  name: string
  city: string
  state: string
  population: number
}

export type Politician = {
  id: string
  name: string
  party: string
  role: string
  district_id: string
  avatar_url?: string
  response_rate: number
}

export type Topic = {
  id: string
  title: string
  description: string
  category: string
  district_id: string
  created_at: string
  status: 'active' | 'resolved' | 'pending'
}

export type Vote = {
  id: string
  title: string
  description: string
  district_id: string
  created_at: string
  ends_at: string
  total_votes: number
  representation_score: number
  options: VoteOption[]
}

export type VoteOption = {
  id: string
  vote_id: string
  label: string
  count: number
}

export type Demand = {
  id: string
  title: string
  description: string
  category: string
  district_id: string
  user_id: string
  supports: number
  status: 'eingereicht' | 'geprüft' | 'bearbeitet' | 'umgesetzt' | 'abgelehnt'
  created_at: string
}

export type Profile = {
  id: string
  full_name: string
  district_id: string
  age_group: string
  gender: string
  avatar_url?: string
}
