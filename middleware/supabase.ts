import { createClient } from "@supabase/supabase-js";
import { IReferral } from "@/types/referral";

export const supabase = createClient(
  process.env["SUPABASE_URL"] ?? ``,
  process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? ``
);


export async function getReferralsByCreatorFid(fid: number) {
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("creator_fid", fid);
  return data;
}


export async function updateReferral(referral: IReferral) {
  try {
    const { data, error } = await supabase
      .from("referrals")
      .update(referral)
      .eq("id", referral.id);
    return data;

  } catch(err) {
    console.error(err);
  }
}

export async function createReferral(fid: number, fname: string): Promise<IReferral | undefined> {
  try {
    const { data, error } = await supabase
      .from("referrals")
      .insert({ creator_fid: fid, pending_referrals: [fname], accepted_referrals: [] })
      .select()
      .single();
    
    if (error) {
      console.error(error);
      return;
    }
    
    return data as IReferral;
  } catch(err) {
    console.error(err);
  }
}