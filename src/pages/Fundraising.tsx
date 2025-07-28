import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, TrendingUp, Trophy, Target, Users } from "lucide-react";

interface FundraisingData {
  id: string;
  user_id: string;
  target_amount: number;
  collected_amount: number;
  profiles: {
    full_name: string;
  } | null;
}

export default function Fundraising() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myProgress, setMyProgress] = useState<FundraisingData | null>(null);
  const [leaderboard, setLeaderboard] = useState<FundraisingData[]>([]);
  const [loading, setLoading] = useState(true);

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
        .select("*")
        .order("collected_amount", { ascending: false })
        .limit(10);

      setMyProgress(myData ? { ...myData, profiles: null } : null);
      setLeaderboard((leaderboardData || []).map(item => ({ ...item, profiles: null })));
    } catch (error) {
      console.error("Error fetching fundraising data:", error);
    } finally {
      setLoading(false);
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
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Trophy className="w-5 h-5 text-orange-600" />;
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{index + 1}</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-8 w-8 text-primary mx-auto animate-pulse mb-4" />
          <p>Loading fundraising data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Heart className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Fundraising Tracker</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Progress */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-6 h-6 mr-3 text-primary" />
                  Your Fundraising Progress
                </CardTitle>
                <CardDescription>Track your journey towards your fundraising goal</CardDescription>
              </CardHeader>
              <CardContent>
                {myProgress && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
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

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{(myProgress.target_amount - myProgress.collected_amount).toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">Remaining</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(calculateProgress(myProgress.collected_amount, myProgress.target_amount))}%
                        </div>
                        <div className="text-sm text-blue-600">Completed</div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button className="w-full" size="lg">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Update Progress
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fundraising Tips */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Fundraising Tips</CardTitle>
                <CardDescription>Strategies to help you reach your goal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">🎯 Set Mini Goals</h4>
                    <p className="text-sm text-yellow-700">Break your target into smaller, achievable milestones.</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">📱 Use Social Media</h4>
                    <p className="text-sm text-blue-700">Share your cause on social platforms to reach more people.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">🤝 Personal Networks</h4>
                    <p className="text-sm text-green-700">Start with family and friends who believe in your mission.</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">📖 Tell Your Story</h4>
                    <p className="text-sm text-purple-700">Share why this cause matters to you personally.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Leaderboard */}
          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
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
                        className={`flex items-center space-x-3 p-3 rounded-lg ${
                          isCurrentUser ? 'bg-primary/10 border-2 border-primary' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {getLeaderboardIcon(index)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-primary' : 'text-gray-900'}`}>
                              {fundraiser.profiles?.full_name || 'Anonymous'}
                              {isCurrentUser && <Badge variant="secondary" className="ml-2">You</Badge>}
                            </p>
                          </div>
                          <div className="mt-1">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>₹{fundraiser.collected_amount.toLocaleString()}</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2 mt-1" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}