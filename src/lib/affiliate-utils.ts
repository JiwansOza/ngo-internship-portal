import { supabase } from "@/integrations/supabase/client";

export interface AffiliateLink {
  id: string;
  user_id: string;
  link_code: string;
  title: string;
  description: string | null;
  target_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
  fundraising_progress?: {
    collected_amount: number;
    target_amount: number;
  } | null;
}

export interface Donation {
  id: string;
  affiliate_link_id: string;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  message: string | null;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_method: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonationFormData {
  donor_name: string;
  donor_email: string;
  amount: number;
  message?: string;
}

/**
 * Get user's affiliate link
 */
export const getUserAffiliateLink = async (userId: string): Promise<AffiliateLink | null> => {
  try {
    const { data, error } = await supabase
      .from("affiliate_links")
      .select(`
        *,
        profiles (
          full_name,
          email
        ),
        fundraising_progress (
          collected_amount,
          target_amount
        )
      `)
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching affiliate link:", error);
    return null;
  }
};

/**
 * Get affiliate link by code (public access)
 */
export const getAffiliateLinkByCode = async (linkCode: string): Promise<AffiliateLink | null> => {
  try {
    const { data, error } = await supabase
      .from("affiliate_links")
      .select(`
        *,
        profiles (
          full_name,
          email
        ),
        fundraising_progress (
          collected_amount,
          target_amount
        )
      `)
      .eq("link_code", linkCode)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching affiliate link by code:", error);
    return null;
  }
};

/**
 * Update affiliate link
 */
export const updateAffiliateLink = async (
  linkId: string, 
  updates: Partial<Pick<AffiliateLink, 'title' | 'description' | 'target_amount' | 'is_active'>>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("affiliate_links")
      .update(updates)
      .eq("id", linkId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating affiliate link:", error);
    return false;
  }
};

/**
 * Create a donation
 */
export const createDonation = async (
  affiliateLinkId: string, 
  donationData: DonationFormData
): Promise<Donation | null> => {
  try {
    const { data, error } = await supabase
      .from("donations")
      .insert({
        affiliate_link_id: affiliateLinkId,
        donor_name: donationData.donor_name,
        donor_email: donationData.donor_email,
        amount: donationData.amount,
        message: donationData.message || null,
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating donation:", error);
    return null;
  }
};

/**
 * Get donations for an affiliate link
 */
export const getDonationsForLink = async (affiliateLinkId: string): Promise<Donation[]> => {
  try {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("affiliate_link_id", affiliateLinkId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching donations:", error);
    return [];
  }
};

/**
 * Update donation payment status
 */
export const updateDonationStatus = async (
  donationId: string, 
  status: 'pending' | 'completed' | 'failed',
  transactionId?: string,
  paymentMethod?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("donations")
      .update({
        payment_status: status,
        transaction_id: transactionId || null,
        payment_method: paymentMethod || null
      })
      .eq("id", donationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating donation status:", error);
    return false;
  }
};

/**
 * Generate shareable URL for affiliate link
 */
export const generateShareableUrl = (linkCode: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/donate/${linkCode}`;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Error copying to clipboard:", error);
    return false;
  }
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (collected: number, target: number): number => {
  return Math.min((collected / target) * 100, 100);
};

/**
 * Format amount for display
 */
export const formatAmount = (amount: number): string => {
  return `₹${amount.toLocaleString()}`;
};

/**
 * Get donation statistics for an affiliate link
 */
export const getDonationStats = async (affiliateLinkId: string) => {
  try {
    const { data, error } = await supabase
      .from("donations")
      .select("amount, payment_status")
      .eq("affiliate_link_id", affiliateLinkId);

    if (error) throw error;

    const totalDonations = data?.length || 0;
    const totalAmount = data?.reduce((sum, donation) => {
      return donation.payment_status === 'completed' ? sum + donation.amount : sum;
    }, 0) || 0;
    const completedDonations = data?.filter(d => d.payment_status === 'completed').length || 0;

    return {
      totalDonations,
      totalAmount,
      completedDonations,
      averageAmount: completedDonations > 0 ? totalAmount / completedDonations : 0
    };
  } catch (error) {
    console.error("Error fetching donation stats:", error);
    return {
      totalDonations: 0,
      totalAmount: 0,
      completedDonations: 0,
      averageAmount: 0
    };
  }
}; 