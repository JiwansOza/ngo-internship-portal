import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Users, TrendingUp, Trophy, Target, Sparkles, Star, Award, 
  TrendingDown, Zap, Lightbulb, MessageSquare, Plus, Share2, Link, 
  DollarSign, Calendar, BarChart3, Gift, Heart
} from "lucide-react";

interface FundraisingData {
  id: string;
  user_id: string;
  target_amount: number;
  collected_amount: number;
  profiles: {
    full_name: string;
  } | null;
}

interface AffiliateLink {
  id: string;
  link_code: string;
  title: string;
  description: string;
  target_amount: number;
  is_active: boolean;
}

export default function Fundraising() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [myProgress, setMyProgress] = useState<FundraisingData | null>(null);
  const [leaderboard, setLeaderboard] = useState<FundraisingData[]>([]);
  const [affiliateLink, setAffiliateLink] = useState<AffiliateLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateAmount, setUpdateAmount] = useState("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  useEffect(() => {
    fetchFundraisingData();
  }, [user]);

  const fetchFundraisingData = async () => {
    try {
      // Fetch my fundraising progress
      const { data: myData } = await supabase
        .from("fundraising_progress")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      // Fetch leaderboard (top 10 fundraisers)
      const { data: leaderboardData } = await supabase
        .from("fundraising_progress")
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order("collected_amount", { ascending: false })
        .limit(10);

      // Fetch affiliate link
      const { data: affiliateData } = await supabase
        .from("affiliate_links")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      setMyProgress(myData ? { ...myData, profiles: null } : null);
      setLeaderboard(leaderboardData || []);
      setAffiliateLink(affiliateData);
    } catch (error) {
      console.error("Error fetching fundraising data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async () => {
    if (!updateAmount || !myProgress) return;

    const amount = parseFloat(updateAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      const newAmount = myProgress.collected_amount + amount;
      
      const { error } = await supabase
        .from("fundraising_progress")
        .update({ collected_amount: newAmount })
        .eq("user_id", user?.id);

      if (error) throw error;

      setMyProgress(prev => prev ? { ...prev, collected_amount: newAmount } : null);
      setUpdateAmount("");
      setIsUpdateDialogOpen(false);

      toast({
        title: "Progress Updated!",
        description: `Successfully added ₹${amount.toLocaleString()} to your fundraising`,
      });

      // Refresh data
      fetchFundraisingData();
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const generateShareableUrl = (linkCode: string) => {
    return `${window.location.origin}/donate/${linkCode}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const calculateProgress = (collected: number, target: number) => {
    return Math.min((collected / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    if (percentage >= 25) return "text-orange-600";
    return "text-red-600";
  };

  const getLeaderboardIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Trophy className="w-6 h-6 text-orange-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{index + 1}</div>;
    }
  };

  const getMilestoneRewards = (percentage: number) => {
    const milestones = [
      { percentage: 25, reward: "Bronze Badge", icon: "🥉" },
      { percentage: 50, reward: "Silver Badge", icon: "🥈" },
      { percentage: 75, reward: "Gold Badge", icon: "🥇" },
      { percentage: 100, reward: "Diamond Badge", icon: "💎" },
    ];
    return milestones.filter(m => percentage >= m.percentage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <Users className="h-12 w-12 text-primary mx-auto animate-pulse mb-4" />
            <Sparkles className="h-6 w-6 text-primary/60 animate-ping absolute -top-2 -right-2" />
          </div>
          <p className="text-gray-600 font-medium">Loading fundraising data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="mr-2 sm:mr-4 hover:bg-primary/5 p-2 sm:px-3"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              <div className="relative">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2 sm:mr-3" />
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary/60 animate-ping absolute -top-1 -right-1" />
              </div>
              <h1 className="text-base sm:text-xl font-semibold text-gray-900">Fundraising Tracker</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/affiliate")}
                className="hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors p-2 sm:px-3"
              >
                <Link className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">My Link</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Fundraising Dashboard</h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Track your progress and compete with other fundraisers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* My Progress */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  Your Fundraising Progress
                </CardTitle>
                <CardDescription>Track your journey towards your fundraising goal</CardDescription>
              </CardHeader>
              <CardContent>
                {myProgress && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2">
                        ₹{myProgress.collected_amount.toLocaleString()}
                      </div>
                      <div className="text-base sm:text-lg text-gray-600">
                        of ₹{myProgress.target_amount.toLocaleString()} goal
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progress</span>
                        <span className={`text-sm font-medium ${getProgressColor(calculateProgress(myProgress.collected_amount, myProgress.target_amount))}`}>
                          {Math.round(calculateProgress(myProgress.collected_amount, myProgress.target_amount))}%
                        </span>
                      </div>
                      <Progress 
                        value={calculateProgress(myProgress.collected_amount, myProgress.target_amount)} 
                        className="h-3 sm:h-4"
                      />
                    </div>

                    {/* Milestone Rewards */}
                    <div className="pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Milestone Rewards</h4>
                      <div className="flex flex-wrap gap-2">
                        {getMilestoneRewards(calculateProgress(myProgress.collected_amount, myProgress.target_amount)).map((milestone, index) => (
                          <div key={index} className="flex items-center space-x-1 px-2 sm:px-3 py-1 bg-yellow-100 rounded-full">
                            <span className="text-sm">{milestone.icon}</span>
                            <span className="text-xs font-medium text-yellow-800">{milestone.reward}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Update Progress Button */}
                    <div className="pt-4">
                      <Button 
                        onClick={() => setIsUpdateDialogOpen(true)}
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Update Progress
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mr-3">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  Leaderboard
                </CardTitle>
                <CardDescription>Top fundraisers this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 rounded-xl border border-gray-200 hover:border-primary/30 transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                          {getLeaderboardIcon(index)}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm sm:text-base text-gray-900">
                            {item.profiles?.full_name || `Fundraiser ${index + 1}`}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {index === 0 ? "🥇 Gold" : index === 1 ? "🥈 Silver" : index === 2 ? "🥉 Bronze" : `#${index + 1}`}
                          </p>
                        </div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-lg sm:text-xl font-bold text-primary">
                          ₹{item.collected_amount.toLocaleString()}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {Math.round(calculateProgress(item.collected_amount, item.target_amount))}% complete
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Affiliate Link */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                    <Link className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  Your Payment Link
                </CardTitle>
                <CardDescription>Share this link to collect donations</CardDescription>
              </CardHeader>
              <CardContent>
                {affiliateLink ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Link Title</Label>
                      <p className="text-sm text-gray-900 font-medium">{affiliateLink.title}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-gray-600">{affiliateLink.description}</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Target Amount</Label>
                      <p className="text-lg font-bold text-primary">₹{affiliateLink.target_amount.toLocaleString()}</p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Shareable Link</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={generateShareableUrl(affiliateLink.link_code)}
                          readOnly
                          className="text-xs sm:text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(generateShareableUrl(affiliateLink.link_code))}
                          className="flex-shrink-0"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/affiliate")}
                        className="flex-1"
                      >
                        <Link className="w-4 h-4 mr-2" />
                        Manage Link
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(generateShareableUrl(affiliateLink.link_code))}
                        className="flex-1"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Link className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">No affiliate link created yet</p>
                    <Button
                      onClick={() => navigate("/affiliate")}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Create Link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips and Tricks */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                    <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  Fundraising Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Share Your Story</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Tell people why this cause matters to you</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-600">2</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Use Social Media</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Post regularly about your progress</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">3</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Follow Up</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Thank donors and keep them updated</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Update Progress Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Fundraising Progress</DialogTitle>
            <DialogDescription>
              Enter the amount you've collected since your last update
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Collected (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={updateAmount}
                onChange={(e) => setUpdateAmount(e.target.value)}
                className="text-lg"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={updateProgress}
                disabled={!updateAmount || parseFloat(updateAmount) <= 0}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}