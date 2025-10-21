import DashboardLayout from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreVertical,
  Users,
  Clock,
  CheckCircle,
  Route,
  TrendingUp,
  Calendar,
} from "lucide-react";

const pathways = [
  {
    id: 1,
    name: "Newcomer Pathway",
    description: "A welcoming journey for first-time visitors",
    steps: 4,
    duration: "4 weeks",
    totalEnrolled: 31,
    completed: 23,
    inProgress: 8,
    status: "Active",
    completionRate: 74,
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Membership Class",
    description: "Learn about our church values and commitments",
    steps: 3,
    duration: "3 weeks",
    totalEnrolled: 57,
    completed: 45,
    inProgress: 12,
    status: "Active",
    completionRate: 79,
    color: "bg-green-500",
  },
  {
    id: 3,
    name: "Leadership Development",
    description: "Develop leadership skills for ministry",
    steps: 6,
    duration: "8 weeks",
    totalEnrolled: 33,
    completed: 18,
    inProgress: 15,
    status: "Active",
    completionRate: 55,
    color: "bg-purple-500",
  },
  {
    id: 4,
    name: "Baptism Preparation",
    description: "Preparation for baptism and faith declaration",
    steps: 2,
    duration: "2 weeks",
    totalEnrolled: 12,
    completed: 9,
    inProgress: 3,
    status: "Active",
    completionRate: 75,
    color: "bg-teal-500",
  },
];

const pathwaySteps = [
  {
    id: 1,
    pathwayId: 1,
    name: "Welcome Meeting",
    description: "Personal meeting with pastor or staff member",
    order: 1,
    completions: 31,
    averageTime: "45 minutes",
  },
  {
    id: 2,
    pathwayId: 1,
    name: "Church Tour",
    description: "Guided tour of church facilities and ministries",
    order: 2,
    completions: 28,
    averageTime: "30 minutes",
  },
  {
    id: 3,
    pathwayId: 1,
    name: "Connect Class",
    description: "Learn about church history, vision, and values",
    order: 3,
    completions: 25,
    averageTime: "2 hours",
  },
  {
    id: 4,
    pathwayId: 1,
    name: "Life Group Connection",
    description: "Join a small group for community and growth",
    order: 4,
    completions: 23,
    averageTime: "Ongoing",
  },
];

const recentProgress = [
  {
    memberName: "Sarah Johnson",
    pathway: "Leadership Development",
    currentStep: "Ministry Placement",
    progress: 83,
    lastActivity: "2 days ago",
    nextStep: "Mentorship Assignment",
  },
  {
    memberName: "Mike Chen",
    pathway: "Membership Class",
    currentStep: "Church History",
    progress: 67,
    lastActivity: "5 days ago",
    nextStep: "Values & Beliefs",
  },
  {
    memberName: "Lisa Rodriguez",
    pathway: "Newcomer Pathway",
    currentStep: "Life Group Connection",
    progress: 100,
    lastActivity: "1 day ago",
    nextStep: "Completed",
  },
  {
    memberName: "David Kim",
    pathway: "Visitor Experience",
    currentStep: "Welcome Meeting",
    progress: 33,
    lastActivity: "3 days ago",
    nextStep: "Church Tour",
  },
];

export default function PathwaysPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pathways</h1>
            <p className="text-muted-foreground">
              Create and manage discipleship journeys for your church community
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Pathway
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Pathways
              </CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">2 in development</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Enrolled
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">133</div>
              <p className="text-xs text-muted-foreground">+12 this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completions</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95</div>
              <p className="text-xs text-muted-foreground">
                71% completion rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Duration
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2</div>
              <p className="text-xs text-muted-foreground">weeks to complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pathways" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pathways">All Pathways</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* All Pathways Tab */}
          <TabsContent value="pathways">
            <div className="grid gap-6">
              {pathways.map((pathway) => (
                <Card key={pathway.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${pathway.color}`}
                        />
                        <div>
                          <CardTitle className="text-lg">
                            {pathway.name}
                          </CardTitle>
                          <CardDescription>
                            {pathway.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{pathway.status}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Pathway</DropdownMenuItem>
                            <DropdownMenuItem>View Analytics</DropdownMenuItem>
                            <DropdownMenuItem>Manage Steps</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Progress
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Completion Rate</span>
                            <span>{pathway.completionRate}%</span>
                          </div>
                          <Progress
                            value={pathway.completionRate}
                            className="h-2"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Enrollment
                        </div>
                        <div className="text-2xl font-bold">
                          {pathway.totalEnrolled}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          total members
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Completed
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {pathway.completed}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          finished pathway
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          In Progress
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {pathway.inProgress}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          currently active
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Route className="h-3 w-3" />
                        {pathway.steps} steps
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {pathway.duration}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Progress Tracking Tab */}
          <TabsContent value="progress">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Progress Updates</CardTitle>
                  <CardDescription>
                    Latest member activity across all pathways
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentProgress.map((progress, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {progress.memberName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {progress.pathway} • {progress.currentStep}
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{progress.progress}%</span>
                            </div>
                            <Progress
                              value={progress.progress}
                              className="h-1"
                            />
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{progress.lastActivity}</div>
                          <div className="text-xs">
                            Next: {progress.nextStep}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pathway Steps</CardTitle>
                  <CardDescription>Steps for Newcomer Pathway</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pathwaySteps.map((step, index) => (
                      <div key={step.id} className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            {step.order}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {step.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {step.description}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {step.completions} completions •{" "}
                              {step.averageTime}
                            </div>
                          </div>
                        </div>
                        {index < pathwaySteps.length - 1 && (
                          <div className="ml-3 w-px h-4 bg-border" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Completion Trends</CardTitle>
                  <CardDescription>
                    Pathway completion rates over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Chart Component Here
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pathway Performance</CardTitle>
                  <CardDescription>
                    Comparison of pathway effectiveness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pathways.map((pathway) => (
                      <div key={pathway.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">
                            {pathway.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {pathway.completionRate}%
                          </div>
                        </div>
                        <Progress
                          value={pathway.completionRate}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bottleneck Analysis</CardTitle>
                  <CardDescription>
                    Identify steps where members commonly stop
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">
                          Welcome Meeting
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Newcomer Pathway
                        </div>
                      </div>
                      <Badge variant="destructive">High Drop-off</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">
                          Ministry Placement
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Leadership Development
                        </div>
                      </div>
                      <Badge variant="secondary">Medium Drop-off</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>
                    Member engagement across pathways
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Time to Complete</span>
                      <span className="font-medium">4.2 weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Most Popular Pathway</span>
                      <span className="font-medium">Membership Class</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Overall Satisfaction</span>
                      <span className="font-medium">4.8/5.0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
