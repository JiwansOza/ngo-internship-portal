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
          <div className="relative">
            <Heart className="h-12 w-12 text-primary mx-auto animate-pulse mb-4" />
            <Sparkles className="h-6 w-6 text-primary/60 animate-ping absolute -top-2 -right-2" />
          </div>
          <p className="text-gray-600 font-medium">Loading donation page...</p>
        </div>
      </div>
    );
  }

  if (!affiliateLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Link Not Found</h2>
          <p className="text-gray-600 mb-4">This fundraising link is no longer available.</p>
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
                className="mr-4 hover:bg-primary/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="relative">
                <Heart className="h-8 w-8 text-primary mr-3" />
                <Sparkles className="h-4 w-4 text-primary/60 animate-ping absolute -top-1 -right-1" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Support Fundraising</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign Info */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mr-3">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  {affiliateLink.title}
                </CardTitle>
                <CardDescription>
                  by {affiliateLink.profiles?.full_name || 'Anonymous'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {affiliateLink.description && (
                  <p className="text-gray-600">{affiliateLink.description}</p>
                )}
                
                <div className="space-y-3">
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
                      <div className="text-sm text-gray-600">Raised</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatAmount(affiliateLink.fundraising_progress?.target_amount || affiliateLink.target_amount)}
                      </div>
                      <div className="text-sm text-gray-600">Goal</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Stats */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  Campaign Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Supporting NGO Internship</p>
                    <p className="font-semibold text-gray-900">Empowering Change</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fundraising Goal</p>
                    <p className="font-semibold text-gray-900">{formatAmount(affiliateLink.fundraising_progress?.target_amount || affiliateLink.target_amount)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Gift className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Your Contribution</p>
                    <p className="font-semibold text-gray-900">Makes a Difference</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donation Form */}
          <div>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  Make a Donation
                </CardTitle>
                <CardDescription>
                  Support this fundraising campaign with your contribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Amount Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      Select Amount (₹)
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {presetAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant={formData.amount === amount ? "default" : "outline"}
                          className="h-12"
                          onClick={() => setFormData({ ...formData, amount })}
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      placeholder="Enter custom amount"
                      className="h-12 border-2 focus:border-primary"
                      min="1"
                    />
                  </div>

                  {/* Donor Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Your Name *
                      </label>
                      <Input
                        value={formData.donor_name}
                        onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                        placeholder="Enter your name"
                        className="h-12 border-2 focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={formData.donor_email}
                        onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
                        placeholder="Enter your email"
                        className="h-12 border-2 focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Message (Optional)
                      </label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Leave a message of support..."
                        rows={3}
                        className="border-2 focus:border-primary resize-none"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      Payment Method
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 border-2 border-primary rounded-lg bg-primary/5">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-gray-900">UPI Payment</p>
                          <p className="text-sm text-gray-600">Pay using any UPI app</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Donate ₹{formData.amount.toLocaleString()}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Your donation will be processed securely and will directly support this fundraising campaign.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 