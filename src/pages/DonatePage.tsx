import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  getAffiliateLinkByCode, 
  createDonation, 
  calculateProgress, 
  formatAmount,
  AffiliateLink,
  DonationFormData
} from "@/lib/affiliate-utils";
import { 
  Heart, 
  Users, 
  TrendingUp, 
  Target, 
  ArrowLeft,
  Sparkles,
  Gift,
  MessageSquare,
  CreditCard,
  CheckCircle
} from "lucide-react";

export default function DonatePage() {
  const { linkCode } = useParams<{ linkCode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [affiliateLink, setAffiliateLink] = useState<AffiliateLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<DonationFormData>({
    donor_name: '',
    donor_email: '',
    amount: 100,
    message: ''
  });

  useEffect(() => {
    if (linkCode) {
      fetchAffiliateLink();
    }
  }, [linkCode]);

  const fetchAffiliateLink = async () => {
    try {
      const link = await getAffiliateLinkByCode(linkCode || '');
      if (link) {
        setAffiliateLink(link);
      }
    } catch (error) {
      console.error("Error fetching affiliate link:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliateLink) return;

    setSubmitting(true);
    try {
      const donation = await createDonation(affiliateLink.id, formData);
      
      if (donation) {
        toast({
          title: "Thank you for your donation!",
          description: "Your contribution has been recorded successfully.",
        });
        
        // Reset form
        setFormData({
          donor_name: '',
          donor_email: '',
          amount: 100,
          message: ''
        });
      } else {
        throw new Error("Failed to create donation");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading donation page...</p>
        </div>
      </div>
    );
  }

  if (!affiliateLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Link Not Found</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">This donation link is invalid or has expired.</p>
          <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(
    affiliateLink.fundraising_progress?.collected_amount || 0,
    affiliateLink.fundraising_progress?.target_amount || affiliateLink.target_amount
  );

  const presetAmounts = [50, 100, 200, 500, 1000];

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
                onClick={() => navigate("/")}
                className="mr-2 sm:mr-4 hover:bg-primary/5 p-2 sm:px-3"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
              <div className="relative">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2 sm:mr-3" />
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary/60 animate-ping absolute -top-1 -right-1" />
              </div>
              <h1 className="text-base sm:text-xl font-semibold text-gray-900">Donate</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Campaign Info */}
          <div className="space-y-6 sm:space-y-8">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-3">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  {affiliateLink.title}
                </CardTitle>
                <CardDescription>{affiliateLink.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                      ₹{formatAmount(affiliateLink.fundraising_progress?.collected_amount || 0)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      of ₹{formatAmount(affiliateLink.target_amount)} goal
                    </div>
                  </div>
                  <Progress value={calculateProgress(affiliateLink.fundraising_progress?.collected_amount || 0, affiliateLink.target_amount)} className="h-3" />
                  <div className="text-center text-xs sm:text-sm text-gray-600">
                    {Math.round(calculateProgress(affiliateLink.fundraising_progress?.collected_amount || 0, affiliateLink.target_amount))}% completed
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Stats */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  Campaign Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-green-600">
                      {affiliateLink.donations?.length || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-green-600">Donations</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-blue-600">
                      ₹{formatAmount(affiliateLink.fundraising_progress?.collected_amount || 0)}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-600">Raised</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donation Form */}
          <div className="space-y-6 sm:space-y-8">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                    <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  Make a Donation
                </CardTitle>
                <CardDescription>Support this cause with your contribution</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Name *</label>
                    <Input
                      value={formData.donor_name}
                      onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                      placeholder="Enter your name"
                      required
                      className="h-11 sm:h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address *</label>
                    <Input
                      type="email"
                      value={formData.donor_email}
                      onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
                      placeholder="your@email.com"
                      required
                      className="h-11 sm:h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Donation Amount (₹) *</label>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                      placeholder="100"
                      min="1"
                      required
                      className="h-11 sm:h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message (Optional)</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Leave a message of support..."
                      className="min-h-[100px] sm:min-h-[120px] resize-none"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 sm:h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Donate ₹{formData.amount}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            {affiliateLink.donations && affiliateLink.donations.length > 0 && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    Recent Donations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {affiliateLink.donations.slice(0, 5).map((donation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Heart className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{donation.donor_name}</p>
                            {donation.message && (
                              <p className="text-xs text-gray-600 truncate max-w-[200px]">{donation.message}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">₹{formatAmount(donation.amount)}</p>
                          <p className="text-xs text-gray-500">{new Date(donation.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 