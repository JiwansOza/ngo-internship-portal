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
                className="mr-4 hover:bg-primary/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="relative">
                <Users className="h-8 w-8 text-primary mr-3" />
                <Sparkles className="h-4 w-4 text-primary/60 animate-ping absolute -top-1 -right-1" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Fundraising Tracker</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/affiliate")}
                className="hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors"
              >
                <Link className="w-4 h-4 mr-2" />
                My Link
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold text-gray-900">Fundraising Dashboard</h2>
          </div>
          <p className="text-gray-600">Track your progress and compete with other fundraisers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Progress */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  Your Fundraising Progress
                </CardTitle>
                <CardDescription>Track your journey towards your fundraising goal</CardDescription>
              </CardHeader>
              <CardContent>
                {myProgress && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">
                        ₹{myProgress.collected_amount.toLocaleString()}
                      </div>
                      <div className="text-lg text-gray-600">
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
                        className="h-4"
                      />
                    </div>

                    {/* Milestone Rewards */}
                    <div className="pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Milestone Rewards</h4>
                      <div className="flex space-x-2">
                        {getMilestoneRewards(calculateProgress(myProgress.collected_amount, myProgress.target_amount)).map((milestone, index) => (
                          <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 rounded-full">
                            <span className="text-sm">{milestone.icon}</span>
                            <span className="text-xs font-medium text-yellow-800">{milestone.reward}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{(myProgress.target_amount - myProgress.collected_amount).toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">Remaining</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(calculateProgress(myProgress.collected_amount, myProgress.target_amount))}%
                        </div>
                        <div className="text-sm text-blue-600">Completed</div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300" size="lg">
                            <Plus className="w-5 h-5 mr-2" />
                            Update Progress
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Fundraising Progress</DialogTitle>
                            <DialogDescription>
                              Add the amount you've collected to update your progress
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="amount">Amount Collected (₹)</Label>
                              <Input
                                id="amount"
                                type="number"
                                placeholder="Enter amount"
                                value={updateAmount}
                                onChange={(e) => setUpdateAmount(e.target.value)}
                              />
                            </div>
                            <Button onClick={updateProgress} className="w-full">
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Update Progress
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Affiliate Link Section */}
            {affiliateLink && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                      <Share2 className="w-5 h-5 text-white" />
                    </div>
                    Share Your Fundraising Link
                  </CardTitle>
                  <CardDescription>Share this link to collect donations from supporters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{affiliateLink.title}</p>
                          <p className="text-sm text-gray-600">{affiliateLink.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(generateShareableUrl(affiliateLink.link_code))}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>
                      </div>
                      <div className="mt-3 p-3 bg-white rounded-lg border">
                        <p className="text-sm font-mono text-gray-600 break-all">
                          {generateShareableUrl(affiliateLink.link_code)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate("/affiliate")}
                        className="flex-1"
                      >
                        <Link className="w-4 h-4 mr-2" />
                        Manage Link
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(generateShareableUrl(affiliateLink.link_code), '_blank')}
                        className="flex-1"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Test Link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fundraising Tips */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mr-3">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  Fundraising Tips
                </CardTitle>
                <CardDescription>Strategies to help you reach your goal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <Target className="w-4 h-4 text-yellow-600 mr-2" />
                      <h4 className="font-medium text-yellow-800">Set Mini Goals</h4>
                    </div>
                    <p className="text-sm text-yellow-700">Break your target into smaller, achievable milestones.</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <Zap className="w-4 h-4 text-blue-600 mr-2" />
                      <h4 className="font-medium text-blue-800">Use Social Media</h4>
                    </div>
                    <p className="text-sm text-blue-700">Share your cause on social platforms to reach more people.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <Users className="w-4 h-4 text-green-600 mr-2" />
                      <h4 className="font-medium text-green-800">Personal Networks</h4>
                    </div>
                    <p className="text-sm text-green-700">Start with family and friends who believe in your mission.</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="w-4 h-4 text-purple-600 mr-2" />
                      <h4 className="font-medium text-purple-800">Tell Your Story</h4>
                    </div>
                    <p className="text-sm text-purple-700">Share why this cause matters to you personally.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Leaderboard */}
          <div className="space-y-8">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mr-3">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  Leaderboard
                </CardTitle>
                <CardDescription>Top fundraisers this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((fundraiser, index) => {
                    const progress = calculateProgress(fundraiser.collected_amount, fundraiser.target_amount);
                    const isCurrentUser = fundraiser.user_id === user?.id;
                    
                    return (
                      <div 
                        key={fundraiser.id} 
                        className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                          isCurrentUser ? 'bg-primary/10 border-primary/30 shadow-md' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {getLeaderboardIcon(index)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-primary' : 'text-gray-900'}`}>
                              {fundraiser.profiles?.full_name || 'Anonymous'}
                              {isCurrentUser && <Badge variant="secondary" className="ml-2">You</Badge>}
                            </p>
                            <span className="text-sm font-bold text-primary">
                              ₹{fundraiser.collected_amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>Progress</span>
                              <span className={getProgressColor(progress)}>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-700">Total Raised</span>
                    <span className="font-semibold text-green-600">₹{leaderboard.reduce((sum, item) => sum + item.collected_amount, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700">Active Fundraisers</span>
                    <span className="font-semibold text-blue-600">{leaderboard.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-purple-700">Your Rank</span>
                    <span className="font-semibold text-purple-600">
                      #{leaderboard.findIndex(item => item.user_id === user?.id) + 1 || 'N/A'}
                    </span>
                  </div>
                  {myProgress && (
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm text-orange-700">Days Active</span>
                      <span className="font-semibold text-orange-600">
                        {Math.ceil((Date.now() - new Date(myProgress.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}