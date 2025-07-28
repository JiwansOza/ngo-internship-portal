import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  getAllFundraisingData, 
  getFundraisingStats, 
  exportFundraisingDataAsCSV,
  FundraisingData,
  FundraisingStats 
} from "@/lib/fundraising-utils";
import { 
  Download, 
  Users, 
  TrendingUp, 
  Target, 
  Star,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminFundraising() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fundraisingData, setFundraisingData] = useState<FundraisingData[]>([]);
  const [stats, setStats] = useState<FundraisingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [data, statsData] = await Promise.all([
        getAllFundraisingData(),
        getFundraisingStats()
      ]);
      
      setFundraisingData(data);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvData = await exportFundraisingDataAsCSV();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fundraising-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
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
              <h1 className="text-xl font-semibold text-gray-900">Fundraising Admin</h1>
            </div>
            <Button onClick={handleExportCSV} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Raised</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{stats.total_raised.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fundraisers</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.total_fundraisers}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Raised</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{Math.round(stats.average_raised).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Target</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      ₹{Math.round(stats.average_target).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.completion_rate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fundraising Data Table */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              Fundraising Data
            </CardTitle>
            <CardDescription>
              Complete list of all fundraising progress ({fundraisingData.length} fundraisers)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Target</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Collected</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Progress</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fundraisingData.map((item, index) => {
                    const progress = (item.collected_amount / item.target_amount) * 100;
                    const isCurrentUser = item.user_id === user?.id;
                    
                    return (
                      <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 ${isCurrentUser ? 'bg-primary/5' : ''}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">#{index + 1}</span>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs">You</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">
                            {item.profiles?.full_name || 'Anonymous'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.profiles?.email || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          ₹{item.target_amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          ₹{item.collected_amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {progress >= 100 ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Completed
                            </Badge>
                          ) : progress >= 75 ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Excellent
                            </Badge>
                          ) : progress >= 50 ? (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              Good
                            </Badge>
                          ) : progress >= 25 ? (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                              Fair
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              Needs Work
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 