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
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading fundraising data...</p>
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
              <h1 className="text-base sm:text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <Button
              onClick={handleExportCSV}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Fundraising Overview</h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Monitor all fundraising activities and progress</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Total Fundraisers</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalFundraisers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Total Raised</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">₹{stats.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Average Progress</p>
                    <p className="text-lg sm:text-2xl font-bold text-purple-600">{Math.round(stats.averageProgress)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Top Fundraiser</p>
                    <p className="text-lg sm:text-2xl font-bold text-yellow-600">₹{stats.topAmount.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fundraising List */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mr-3">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              Fundraising Progress
            </CardTitle>
            <CardDescription>All active fundraising campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fundraisingData.map((item, index) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-gray-200 hover:border-primary/30 transition-all duration-200 space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm sm:text-base font-bold text-gray-600">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm sm:text-base text-gray-900">
                        {item.profiles?.full_name || `Fundraiser ${index + 1}`}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {item.affiliate_links?.title || "NGO Internship Fundraising"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-bold text-primary">
                        ₹{item.collected_amount.toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        of ₹{item.target_amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 sm:w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((item.collected_amount / item.target_amount) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <Badge className={`text-xs ${
                        (item.collected_amount / item.target_amount) * 100 >= 100 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : (item.collected_amount / item.target_amount) * 100 >= 50 
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {Math.round((item.collected_amount / item.target_amount) * 100)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 