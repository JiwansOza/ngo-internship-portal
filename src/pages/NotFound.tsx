import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
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
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2 sm:mr-3" />
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary/60 animate-ping absolute -top-1 -right-1" />
              </div>
              <h1 className="text-base sm:text-xl font-semibold text-gray-900">NGO Internship Portal</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-6xl sm:text-8xl font-bold text-gray-300 mb-4">404</CardTitle>
            <CardDescription className="text-lg sm:text-xl text-gray-600">
              Oops! Page not found
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm sm:text-base text-gray-500">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button 
                onClick={() => navigate("/")}
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
