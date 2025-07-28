import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Download, 
  LogOut,
  TrendingUp,
  Target,
  FileText,
  Users,
  Sparkles,
  Star,
  Trophy,
  Award,
  Calendar,
  ArrowRight,
  BarChart3,
  Link,
  Share2,
  Eye,
  X
} from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Application {
  id: string;
  status: string;
  created_at: string;
  full_name: string;
  email: string;
  phone_number: string;
  motivation: string;
  resume_url: string | null;
}

interface OnboardingTask {
  id: string;
  task_name: string;
  description: string;
  is_completed: boolean;
  order_index: number;
}

interface FundraisingProgress {
  target_amount: number;
  collected_amount: number;
}

interface Certificate {
  is_eligible: boolean;
  certificate_url: string | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [fundraising, setFundraising] = useState<FundraisingProgress | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);


  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {

      // Fetch application status
      const { data: applicationData } = await supabase
        .from("applications")
        .select("id, status, created_at, full_name, email, phone_number, motivation, resume_url")
        .eq("user_id", user?.id)
        .single();

      // Fetch onboarding tasks
      const { data: tasksData } = await supabase
        .from("onboarding_tasks")
        .select("*")
        .eq("user_id", user?.id)
        .order("order_index");

      // Fetch fundraising progress
      const { data: fundraisingData } = await supabase
        .from("fundraising_progress")
        .select("target_amount, collected_amount")
        .eq("user_id", user?.id)
        .single();

      // Fetch certificate eligibility
      const { data: certificateData } = await supabase
        .from("certificates")
        .select("is_eligible, certificate_url")
        .eq("user_id", user?.id)
        .single();

      setApplication(applicationData);
      setTasks(tasksData || []);
      setFundraising(fundraisingData);
      setCertificate(certificateData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("onboarding_tasks")
        .update({ is_completed: !currentStatus })
        .eq("id", taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, is_completed: !currentStatus } : task
      ));

      toast({
        title: "Task updated",
        description: !currentStatus ? "Task marked as completed!" : "Task marked as incomplete",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const downloadApplication = () => {
    if (!application) return;

    // Create a temporary div to render the content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.padding = '40px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.color = 'black';
    tempDiv.style.lineHeight = '1.6';
    
    tempDiv.innerHTML = `
      <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #1e40af; font-size: 28px;">Internship Application Details</h1>
        <p style="margin: 10px 0 0 0; color: #64748b;">NGO Reach Platform</p>
      </div>
      
      <div style="margin-bottom: 25px;">
        <h3 style="color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px;">Basic Information</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div style="margin-bottom: 10px;">
            <strong style="color: #374151;">Application ID:</strong><br>
            <span style="color: #111827;">${application.id}</span>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #374151;">Status:</strong><br>
            <span style="color: #111827;">${application.status.toUpperCase()}</span>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #374151;">Applied Date:</strong><br>
            <span style="color: #111827;">${new Date(application.created_at).toLocaleDateString()}</span>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #374151;">Full Name:</strong><br>
            <span style="color: #111827;">${application.full_name}</span>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #374151;">Email:</strong><br>
            <span style="color: #111827;">${application.email}</span>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #374151;">Phone Number:</strong><br>
            <span style="color: #111827;">${application.phone_number}</span>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 25px;">
        <h3 style="color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px;">Motivation Statement</h3>
        <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin-top: 10px;">
          ${application.motivation.replace(/\n/g, '<br>')}
        </div>
      </div>
      
      <div style="margin-bottom: 25px;">
        <h3 style="color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px;">Resume</h3>
        <p><strong style="color: #374151;">Status:</strong> ${application.resume_url ? "Attached" : "Not provided"}</p>
        ${application.resume_url ? `<p><strong style="color: #374151;">Resume URL:</strong> ${application.resume_url}</p>` : ""}
      </div>
      
      <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>NGO Reach Platform - Internship Application System</p>
      </div>
    `;
    
    document.body.appendChild(tempDiv);

    // Convert to canvas and then to PDF
    html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`application-${application.id.slice(0, 8)}.pdf`);
      
      // Clean up
      document.body.removeChild(tempDiv);
      
      toast({
        title: "Application downloaded",
        description: "Your application details have been saved as PDF.",
      });
    });
  };

  const viewApplicationDetails = () => {
    setIsViewModalOpen(true);
  };

  const downloadCertificate = () => {
    if (!certificate?.is_eligible) {
      toast({
        title: "Certificate not available",
        description: "Complete your tasks and fundraising goals to become eligible.",
        variant: "destructive",
      });
      return;
    }

    if (certificate.certificate_url) {
      // If there's a certificate URL, download it
      const link = document.createElement('a');
      link.href = certificate.certificate_url;
      link.download = `certificate-${user?.id?.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Create a temporary div to render the certificate
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '60px';
      tempDiv.style.fontFamily = 'Times New Roman, serif';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.color = 'black';
      tempDiv.style.textAlign = 'center';
      tempDiv.style.border = '8px solid #1e40af';
      tempDiv.style.borderRadius = '15px';
      tempDiv.style.position = 'relative';
      
      tempDiv.innerHTML = `
        <div style="margin-bottom: 40px;">
          <div style="font-size: 48px; font-weight: bold; color: #1e40af; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">Certificate of Completion</div>
          <div style="font-size: 18px; color: #64748b; margin-bottom: 50px;">NGO Reach Platform</div>
        </div>
        
        <div style="margin-bottom: 50px;">
          <div style="font-size: 24px; color: #374151; margin-bottom: 30px; line-height: 1.4;">
            This is to certify that
          </div>
          <div style="font-size: 32px; font-weight: bold; color: #1e40af; margin-bottom: 20px; text-transform: uppercase;">
            ${user?.email || "NGO Intern"}
          </div>
          <div style="font-size: 20px; color: #64748b; margin-bottom: 30px;">
            has successfully completed the
          </div>
          <div style="font-size: 20px; color: #1e40af; font-weight: bold;">
            NGO Internship Program
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 40px 0; text-align: left;">
          <div style="margin-bottom: 15px;">
            <div style="font-weight: bold; color: #374151; font-size: 14px;">COMPLETION DATE</div>
            <div style="color: #111827; font-size: 16px; margin-top: 5px;">${new Date().toLocaleDateString()}</div>
          </div>
          <div style="margin-bottom: 15px;">
            <div style="font-weight: bold; color: #374151; font-size: 14px;">PROGRAM DURATION</div>
            <div style="color: #111827; font-size: 16px; margin-top: 5px;">3 Months</div>
          </div>
          <div style="margin-bottom: 15px;">
            <div style="font-weight: bold; color: #374151; font-size: 14px;">STATUS</div>
            <div style="color: #111827; font-size: 16px; margin-top: 5px;">Completed</div>
          </div>
          <div style="margin-bottom: 15px;">
            <div style="font-weight: bold; color: #374151; font-size: 14px;">CERTIFICATE ID</div>
            <div style="color: #111827; font-size: 16px; margin-top: 5px;">CERT-${user?.id?.slice(0, 8)}</div>
          </div>
        </div>
        
        <div style="margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="text-align: center; flex: 1;">
            <div style="width: 200px; height: 2px; background: #1e40af; margin: 20px auto 10px;"></div>
            <div style="font-weight: bold; color: #1e40af;">Program Director</div>
            <div style="font-size: 12px; color: #64748b;">NGO Reach Platform</div>
          </div>
          <div style="text-align: center; flex: 1;">
            <div style="width: 200px; height: 2px; background: #1e40af; margin: 20px auto 10px;"></div>
            <div style="font-weight: bold; color: #1e40af;">Executive Director</div>
            <div style="font-size: 12px; color: #64748b;">NGO Reach Platform</div>
          </div>
        </div>
        
        <div style="margin-top: 40px; font-size: 12px; color: #6b7280;">
          <p>This certificate is issued in recognition of successful completion of all program requirements</p>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div style="position: absolute; bottom: 20px; right: 20px; font-size: 10px; color: #9ca3af;">
          ID: CERT-${user?.id?.slice(0, 8)}
        </div>
      `;
      
      document.body.appendChild(tempDiv);

      // Convert to canvas and then to PDF
      html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`certificate-${user?.id?.slice(0, 8)}.pdf`);
        
        // Clean up
        document.body.removeChild(tempDiv);
        
        toast({
          title: "Certificate downloaded",
          description: "Your completion certificate has been saved as PDF.",
        });
      });
    }

    toast({
      title: "Certificate downloaded",
      description: "Your completion certificate has been saved as HTML file.",
    });
  };

  const completedTasks = tasks.filter(task => task.is_completed).length;
  const progressPercentage = fundraising ? (fundraising.collected_amount / fundraising.target_amount) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <Users className="h-12 w-12 text-primary mx-auto animate-pulse mb-4" />
            <Sparkles className="h-6 w-6 text-primary/60 animate-ping absolute -top-2 -right-2" />
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900">NGO Reach</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* User Info */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{user?.email}</span>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate("/affiliate")}
                  className="text-gray-600 hover:text-primary hover:bg-primary/5 p-2 sm:px-3"
                >
                  <Link className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Link</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate("/admin/fundraising")}
                  className="text-gray-600 hover:text-primary hover:bg-primary/5 p-2 sm:px-3"
                >
                  <BarChart3 className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 sm:px-3"
                >
                  <LogOut className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back!</h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Track your progress and stay updated with your internship journey.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Application Status */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Application Status
                </CardTitle>
                <CardDescription>Your internship application progress</CardDescription>
              </CardHeader>
              <CardContent>
                {application ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          Applied on: {new Date(application.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Application ID: {application.id.slice(0, 8)}...
                        </p>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        onClick={viewApplicationDetails}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-green-50 hover:border-green-300 transition-colors"
                        onClick={downloadApplication}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">You haven't submitted an application yet.</p>
                    <Button onClick={() => navigate("/apply")} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Submit Application
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application Details Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Application Details
                  </DialogTitle>
                  <DialogDescription>
                    Complete information about your internship application
                  </DialogDescription>
                </DialogHeader>
                {application && (
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">Application ID</label>
                          <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">{application.id}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <div className="flex items-center">
                            {getStatusBadge(application.status)}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">Applied Date</label>
                          <p className="text-sm text-gray-900">{new Date(application.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">Full Name</label>
                          <p className="text-sm text-gray-900">{application.full_name}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <p className="text-sm text-gray-900">{application.email}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">Phone Number</label>
                          <p className="text-sm text-gray-900">{application.phone_number}</p>
                        </div>
                      </div>
                    </div>

                    {/* Motivation Statement */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Motivation Statement</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.motivation}</p>
                      </div>
                    </div>

                    {/* Resume Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Resume</h3>
                      {application.resume_url ? (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Resume has been uploaded</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(application.resume_url, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Resume
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No resume uploaded</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={downloadApplication}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Details
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setIsViewModalOpen(false)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Onboarding Checklist */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Onboarding Checklist
                </CardTitle>
                <CardDescription>Complete these tasks to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                    <span className="text-sm font-medium">Progress</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{completedTasks}/{tasks.length} completed</span>
                      {completedTasks === tasks.length && (
                        <Trophy className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  <Progress value={(completedTasks / tasks.length) * 100} className="mb-6 h-3" />
                  
                  <div className="space-y-3">
                    {tasks.map((task, index) => (
                      <div key={task.id} className="flex items-start space-x-3 p-4 rounded-xl border border-gray-200 hover:border-primary/30 transition-all duration-200 group">
                        <div className="relative mt-1">
                          <input
                            type="checkbox"
                            checked={task.is_completed}
                            onChange={() => toggleTask(task.id, task.is_completed)}
                            className="h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-gray-300 rounded transition-all duration-200"
                          />
                          {task.is_completed && (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary absolute -top-0.5 -right-0.5 animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className={`font-medium text-sm sm:text-base ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {task.task_name}
                            </h4>
                            {index === 0 && !task.is_completed && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                Next
                              </Badge>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 flex-shrink-0">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Fundraising Progress */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Fundraising Goal
                </CardTitle>
                <CardDescription>Your fundraising progress</CardDescription>
              </CardHeader>
              <CardContent>
                {fundraising && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                        ₹{fundraising.collected_amount.toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        of ₹{fundraising.target_amount.toLocaleString()} goal
                      </div>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                    <div className="text-center text-xs sm:text-sm text-gray-600">
                      {Math.round(progressPercentage)}% completed
                    </div>
                    <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" onClick={() => navigate("/fundraising")}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Fundraising
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certificate */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mr-3">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Certificate
                </CardTitle>
                <CardDescription>Download your completion certificate</CardDescription>
              </CardHeader>
              <CardContent>
                {certificate?.is_eligible ? (
                  <div className="text-center space-y-4">
                    <div className="text-green-600">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                      </div>
                      <p className="font-medium text-sm sm:text-base">Certificate Ready!</p>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      onClick={downloadCertificate}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="text-gray-400">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                      <p className="font-medium text-sm sm:text-base">Certificate Not Ready</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2">
                        Complete your tasks and fundraising goals to become eligible
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share Your Link */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <Link className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Share Your Link
                </CardTitle>
                <CardDescription>Create and share your payment link</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-purple-600">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Share2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                    </div>
                    <p className="font-medium text-sm sm:text-base">Ready to Share!</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Get your personalized payment link</p>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    onClick={() => navigate("/affiliate")}
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Manage My Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Tasks Completed</span>
                    <span className="font-semibold text-primary text-sm sm:text-base">{completedTasks}/{tasks.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Fundraising Progress</span>
                    <span className="font-semibold text-primary text-sm sm:text-base">{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Days Active</span>
                    <span className="font-semibold text-primary text-sm sm:text-base">7</span>
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