import { supabase } from "@/integrations/supabase/client";

export interface FundraisingData {
  id: string;
  user_id: string;
  target_amount: number;
  collected_amount: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

export interface FundraisingStats {
  total_raised: number;
  total_fundraisers: number;
  average_raised: number;
  average_target: number;
  completion_rate: number;
}

/**
 * Get all fundraising data with user profiles
 */
export const getAllFundraisingData = async (): Promise<FundraisingData[]> => {
  try {
    const { data, error } = await supabase
      .from("fundraising_progress")
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .order("collected_amount", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching fundraising data:", error);
    return [];
  }
};

/**
 * Get fundraising statistics
 */
export const getFundraisingStats = async (): Promise<FundraisingStats> => {
  try {
    const { data, error } = await supabase
      .from("fundraising_progress")
      .select("target_amount, collected_amount");

    if (error) throw error;

    const total_raised = data?.reduce((sum, item) => sum + item.collected_amount, 0) || 0;
    const total_fundraisers = data?.length || 0;
    const average_raised = total_fundraisers > 0 ? total_raised / total_fundraisers : 0;
    const average_target = data?.reduce((sum, item) => sum + item.target_amount, 0) / total_fundraisers || 0;
    const completion_rate = average_target > 0 ? (average_raised / average_target) * 100 : 0;

    return {
      total_raised,
      total_fundraisers,
      average_raised,
      average_target,
      completion_rate
    };
  } catch (error) {
    console.error("Error fetching fundraising stats:", error);
    return {
      total_raised: 0,
      total_fundraisers: 0,
      average_raised: 0,
      average_target: 0,
      completion_rate: 0
    };
  }
};

/**
 * Export fundraising data as CSV
 */
export const exportFundraisingDataAsCSV = async (): Promise<string> => {
  const data = await getAllFundraisingData();
  
  const headers = [
    "User ID",
    "Full Name", 
    "Email",
    "Target Amount",
    "Collected Amount",
    "Progress %",
    "Created At",
    "Updated At"
  ];

  const csvRows = [
    headers.join(","),
    ...data.map(item => [
      item.user_id,
      `"${item.profiles?.full_name || 'N/A'}"`,
      `"${item.profiles?.email || 'N/A'}"`,
      item.target_amount,
      item.collected_amount,
      ((item.collected_amount / item.target_amount) * 100).toFixed(2),
      item.created_at,
      item.updated_at
    ].join(","))
  ];

  return csvRows.join("\n");
};

/**
 * Get user's fundraising data
 */
export const getUserFundraisingData = async (userId: string): Promise<FundraisingData | null> => {
  try {
    const { data, error } = await supabase
      .from("fundraising_progress")
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user fundraising data:", error);
    return null;
  }
};

/**
 * Get leaderboard data
 */
export const getLeaderboardData = async (limit: number = 10): Promise<FundraisingData[]> => {
  try {
    const { data, error } = await supabase
      .from("fundraising_progress")
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .order("collected_amount", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return [];
  }
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (collected: number, target: number): number => {
  return Math.min((collected / target) * 100, 100);
};

/**
 * Get progress color based on percentage
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 75) return "text-green-600";
  if (percentage >= 50) return "text-yellow-600";
  if (percentage >= 25) return "text-orange-600";
  return "text-red-600";
}; 