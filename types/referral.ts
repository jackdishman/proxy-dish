export interface IReferral {
  id: number;
  creator_fid: number;
  pending_referrals: number[];
  accepted_referrals: number[];
}

export interface IUser {
  display_name: string;
  fid: number;
  avatar: string;
  custody_address: string;
  pfp_url: string;
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
}

export interface ICampaign {
  id: string;
  created_at: string;
  contract_address: string;
}