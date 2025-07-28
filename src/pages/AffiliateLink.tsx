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
                className="mr-4 hover:bg-primary/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="relative">
                <Link className="h-8 w-8 text-primary mr-3" />
                <Sparkles className="h-4 w-4 text-primary/60 animate-ping absolute -top-1 -right-1" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">My Affiliate Link</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold text-gray-900">Share Your Fundraising</h2>
          </div>
          <p className="text-gray-600">Create and share your personalized payment link to receive donations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Affiliate Link Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mr-3">
                      <Link className="w-5 h-5 text-white" />
                    </div>
                    {editing ? "Edit Your Link" : "Your Affiliate Link"}
                  </CardTitle>
                  <div className="flex space-x-2">
                    {editing ? (
                      <>
                        <Button size="sm" onClick={handleSave} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {editing ? "Customize your fundraising link" : "Share this link to receive donations"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Campaign Title</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter your campaign title"
                        className="h-12 border-2 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Tell people about your fundraising campaign..."
                        rows={4}
                        className="border-2 focus:border-primary resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Target Amount (₹)</label>
                      <Input
                        type="number"
                        value={formData.target_amount}
                        onChange={(e) => setFormData({ ...formData, target_amount: Number(e.target.value) })}
                        placeholder="5000"
                        className="h-12 border-2 focus:border-primary"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{affiliateLink.title}</h3>
                      {affiliateLink.description && (
                        <p className="text-gray-600 mt-2">{affiliateLink.description}</p>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Your Link</span>
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={shareableUrl}
                          readOnly
                          className="flex-1 bg-white"
                        />
                        <Button size="sm" onClick={handleCopyLink} variant="outline">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleShare} className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Link
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  Fundraising Progress
                </CardTitle>
                <CardDescription>Track your campaign performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-primary">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatAmount(affiliateLink.fundraising_progress?.collected_amount || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Collected</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatAmount(affiliateLink.fundraising_progress?.target_amount || affiliateLink.target_amount)}
                      </div>
                      <div className="text-sm text-gray-600">Target</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  Donation Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Total Donations</span>
                  </div>
                  <span className="font-bold text-gray-900">{donationStats.totalDonations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                  <span className="font-bold text-green-600">{donationStats.completedDonations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Total Raised</span>
                  </div>
                  <span className="font-bold text-primary">{formatAmount(donationStats.totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">Average</span>
                  </div>
                  <span className="font-bold text-purple-600">{formatAmount(donationStats.averageAmount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/fundraising")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Fundraising
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/dashboard")}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 