import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  Heart
} from "lucide-react";

interface Application {
  id: string;
  status: string;
  created_at: string;
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
        .select("*")
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
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const completedTasks = tasks.filter(task => task.is_completed).length;
  const progressPercentage = fundraising ? (fundraising.collected_amount / fundraising.target_amount) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-8 w-8 text-primary mx-auto animate-pulse mb-4" />
          <p>Loading your dashboard...</p>
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
              <Heart className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">NGO Internship Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Application Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Application Status
                </CardTitle>
                <CardDescription>Your internship application progress</CardDescription>
              </CardHeader>
              <CardContent>
                {application ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Applied on: {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">You haven't submitted an application yet.</p>
                    <Button onClick={() => navigate("/apply")}>
                      Submit Application
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Onboarding Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Checklist</CardTitle>
                <CardDescription>Complete these tasks to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{completedTasks}/{tasks.length} completed</span>
                  </div>
                  <Progress value={(completedTasks / tasks.length) * 100} className="mb-4" />
                  
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                        <input
                          type="checkbox"
                          checked={task.is_completed}
                          onChange={() => toggleTask(task.id, task.is_completed)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <h4 className={`font-medium ${task.is_completed ? 'line-through text-gray-500' : ''}`}>
                            {task.task_name}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-gray-600">{task.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Fundraising Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Fundraising Goal
                </CardTitle>
                <CardDescription>Your fundraising progress</CardDescription>
              </CardHeader>
              <CardContent>
                {fundraising && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        ₹{fundraising.collected_amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        of ₹{fundraising.target_amount.toLocaleString()} goal
                      </div>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                    <div className="text-center text-sm text-gray-600">
                      {Math.round(progressPercentage)}% completed
                    </div>
                    <Button className="w-full" onClick={() => navigate("/fundraising")}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Fundraising
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certificate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Certificate
                </CardTitle>
                <CardDescription>Download your completion certificate</CardDescription>
              </CardHeader>
              <CardContent>
                {certificate?.is_eligible ? (
                  <div className="text-center space-y-4">
                    <div className="text-green-600">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-medium">Certificate Ready!</p>
                    </div>
                    <Button className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="text-gray-400">
                      <Clock className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-medium">Certificate Not Ready</p>
                      <p className="text-sm text-gray-600">
                        Complete your tasks and fundraising goals to become eligible
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}