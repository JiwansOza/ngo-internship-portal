import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  getUserAffiliateLink, 
  updateAffiliateLink, 
  generateShareableUrl, 
  copyToClipboard,
  calculateProgress,
  formatAmount,
  getDonationStats,
  AffiliateLink
} from "@/lib/affiliate-utils";
import { 
  Share2, 
  Copy, 
  Link, 
  Users, 
  TrendingUp, 
  Target, 
  ArrowLeft,
  Sparkles,
  Edit,
  Save,
  X,
  Heart,
  MessageSquare,
  Gift
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AffiliateLink() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [affiliateLink, setAffiliateLink] = useState<AffiliateLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [donationStats, setDonationStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    completedDonations: 0,
    averageAmount: 0
  });

  // Form state for editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: 5000
  });

  useEffect(() => {
    if (user) {
      fetchAffiliateLink();
    }
  }, [user]);

  const fetchAffiliateLink = async () => {
    try {
      const link = await getUserAffiliateLink(user?.id || '');
      if (link) {
        setAffiliateLink(link);
        setFormData({
          title: link.title,
          description: link.description || '',
          target_amount: link.target_amount
        });
        
        // Fetch donation stats
        const stats = await getDonationStats(link.id);
        setDonationStats(stats);
      }
    } catch (error) {
      console.error("Error fetching affiliate link:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!affiliateLink) return;

    try {
      const success = await updateAffiliateLink(affiliateLink.id, {
        title: formData.title,
        description: formData.description,
        target_amount: formData.target_amount
      });

      if (success) {
        await fetchAffiliateLink();
        setEditing(false);
        toast({
          title: "Success",
          description: "Your affiliate link has been updated!",
        });
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update affiliate link",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    if (!affiliateLink) return;

    const shareableUrl = generateShareableUrl(affiliateLink.link_code);
    const success = await copyToClipboard(shareableUrl);

    if (success) {
      toast({
        title: "Link copied!",
        description: "Your affiliate link has been copied to clipboard",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!affiliateLink) return;

    const shareableUrl = generateShareableUrl(affiliateLink.link_code);
    const shareText = `Support my fundraising campaign! ${shareableUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: affiliateLink.title,
          text: shareText,
          url: shareableUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to copying
      await handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <Link className="h-12 w-12 text-primary mx-auto animate-pulse mb-4" />
            <Sparkles className="h-6 w-6 text-primary/60 animate-ping absolute -top-2 -right-2" />
          </div>
          <p className="text-gray-600 font-medium">Loading your affiliate link...</p>
        </div>
      </div>
    );
  }

  if (!affiliateLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Link className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">No affiliate link found.</p>
          <Button onClick={() => navigate("/dashboard")} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(
    affiliateLink.fundraising_progress?.collected_amount || 0,
    affiliateLink.fundraising_progress?.target_amount || affiliateLink.target_amount
  );

  const shareableUrl = generateShareableUrl(affiliateLink.link_code);

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
              <h1 className="text-base sm:text-xl font-semibold text-gray-900">Affiliate Link</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Manage Your Payment Link</h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Create and customize your fundraising link</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Link Details */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                    <Link className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  Link Details
                </CardTitle>
                <CardDescription>Customize your fundraising link</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm sm:text-base text-gray-600">Loading your link...</p>
                  </div>
                ) : affiliateLink ? (
                  <div className="space-y-6">
                    {editing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter link title"
                            className="h-11 sm:h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your fundraising cause"
                            className="min-h-[100px] sm:min-h-[120px] resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Target Amount (₹)</label>
                          <Input
                            type="number"
                            value={formData.target_amount}
                            onChange={(e) => setFormData({ ...formData, target_amount: parseInt(e.target.value) || 0 })}
                            placeholder="5000"
                            className="h-11 sm:h-12"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <Button
                            onClick={handleSave}
                            className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditing(false)}
                            className="flex-1"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">Title</label>
                          <p className="text-base sm:text-lg font-medium text-gray-900">{affiliateLink.title}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">Description</label>
                          <p className="text-sm sm:text-base text-gray-700">{affiliateLink.description || "No description provided"}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">Target Amount</label>
                          <p className="text-lg sm:text-xl font-bold text-primary">₹{formatAmount(affiliateLink.target_amount)}</p>
                        </div>
                        <Button
                          onClick={() => setEditing(true)}
                          variant="outline"
                          className="w-full sm:w-auto"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Link className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">No affiliate link found</p>
                    <Button
                      onClick={() => navigate("/dashboard")}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share Link */}
            {affiliateLink && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                      <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    Share Your Link
                  </CardTitle>
                  <CardDescription>Share this link to collect donations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Shareable Link</label>
                      <div className="flex space-x-2">
                        <Input
                          value={generateShareableUrl(affiliateLink.link_code)}
                          readOnly
                          className="text-xs sm:text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={handleCopyLink}
                          className="flex-shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        onClick={handleShare}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Link
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Progress */}
            {affiliateLink && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                        ₹{formatAmount(donationStats.totalAmount)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        of ₹{formatAmount(affiliateLink.target_amount)} goal
                      </div>
                    </div>
                    <Progress value={calculateProgress(donationStats.totalAmount, affiliateLink.target_amount)} className="h-3" />
                    <div className="text-center text-xs sm:text-sm text-gray-600">
                      {Math.round(calculateProgress(donationStats.totalAmount, affiliateLink.target_amount))}% completed
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            {affiliateLink && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Total Donations</span>
                      <span className="font-semibold text-primary text-sm sm:text-base">{donationStats.totalDonations}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Completed</span>
                      <span className="font-semibold text-green-600 text-sm sm:text-base">{donationStats.completedDonations}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Average Amount</span>
                      <span className="font-semibold text-primary text-sm sm:text-base">₹{formatAmount(donationStats.averageAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mr-3">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Share Widely</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Share your link on social media and with friends</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-600">2</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Tell Your Story</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Explain why this cause matters to you</p>
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
    </div>
  );
} 