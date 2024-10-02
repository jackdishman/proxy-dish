export interface IReferral {
  id: number;
  creator_fid: number;
  pending_referrals: number[];
  accepted_referrals: number[];
}