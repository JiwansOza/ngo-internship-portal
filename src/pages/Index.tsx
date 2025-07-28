import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Award, ArrowRight, CheckCircle, Sparkles, Star, TrendingUp, Globe, HandHeart, Menu, X } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <Users className="h-12 w-12 text-primary animate-pulse mx-auto" />
            <Sparkles className="h-6 w-6 text-primary/60 animate-ping absolute -top-2 -right-2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="relative">
                <Users className="h-8 w-8 text-primary mr-3 animate-pulse" />
                <Sparkles className="h-4 w-4 text-primary/60 animate-ping absolute -top-1 -right-1" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">NGO Internship Portal</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate("/auth")} className="hover:bg-primary/5">
                Sign In
              </Button>
              <Button onClick={() => navigate("/auth")} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300">
                <Sparkles className="w-4 h-4 mr-2" />
                Join as Intern
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <Button variant="outline" onClick={() => navigate("/auth")} className="w-full justify-center">
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")} className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Join as Intern
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative">
                <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-2xl animate-pulse">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </div>
            </div>
            
            <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Join 500+ Changemakers
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Make a <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Difference</span> Today
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              Join our internship program and help us create positive change in communities while gaining valuable experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
              <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => navigate("/auth")}>
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                Start Your Journey
              </Button>
              <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-2 hover:bg-primary/5 transition-all duration-300">
                <Globe className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Learn More
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto px-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">500+</div>
                <div className="text-sm sm:text-base text-gray-600">Active Interns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">₹50L+</div>
                <div className="text-sm sm:text-base text-gray-600">Funds Raised</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">95%</div>
                <div className="text-sm sm:text-base text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Why Choose Us
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Join Our Program?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Our internship program combines meaningful work with professional development
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl">Community Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Work directly with communities and see the real-world impact of your efforts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl">Fundraising Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Learn valuable fundraising skills while supporting important causes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl">Structured Program</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Follow a clear onboarding process with tasks and milestones.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl">Certificate</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Receive an official certificate upon successful completion.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <HandHeart className="h-16 w-16 sm:h-20 sm:w-20 text-white mx-auto mb-6 sm:mb-8 animate-pulse" />
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white/60 animate-ping absolute top-0 right-0" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of young changemakers who are creating positive impact in their communities.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => navigate("/auth")}
          >
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            Apply Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2 sm:mr-3" />
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary/60 animate-ping absolute -top-1 -right-1" />
              </div>
              <span className="text-lg sm:text-xl font-bold">NGO Internship Portal</span>
            </div>
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
              Empowering young minds to create positive change
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              © 2024 NGO Internship Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
