import DashboardLayout from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  TrendingUp,
  Route,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
} from "lucide-react";

const stats = [
  {
    title: "Total Members",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: Users,
  },
  {
    title: "New This Month",
    value: "23",
    change: "+8%",
    trend: "up",
    icon: UserPlus,
  },
  {
    title: "Active Pathways",
    value: "8",
    change: "0%",
    trend: "neutral",
    icon: Route,
  },
  {
    title: "Pathway Completions",
    value: "156",
    change: "+24%",
    trend: "up",
    icon: CheckCircle,
  },
];

const recentActivity = [
  {
    name: "Sarah Johnson",
    action: "Completed",
    target: "Newcomer Pathway",
    time: "2 hours ago",
    type: "completion",
  },
  {
    name: "Mike Chen",
    action: "Joined",
    target: "Young Adults Life Group",
    time: "4 hours ago",
    type: "join",
  },
  {
    name: "Lisa Rodriguez",
    action: "Started",
    target: "Leadership Development",
    time: "1 day ago",
    type: "start",
  },
  {
    name: "David Kim",
    action: "Completed",
    target: "Baptism Preparation",
    time: "2 days ago",
    type: "completion",
  },
];

const upcomingEvents = [
  {
    title: "Leadership Meeting",
    date: "Today",
    time: "2:00 PM",
    attendees: 12,
  },
  {
    title: "Youth Group",
    date: "Tomorrow",
    time: "6:30 PM",
    attendees: 45,
  },
  {
    title: "Sunday Service",
    date: "Sunday",
    time: "10:00 AM",
    attendees: 380,
  },
];

const pathwayProgress = [
  {
    name: "Newcomer Pathway",
    completed: 23,
    inProgress: 8,
    total: 31,
    percentage: 74,
  },
  {
    name: "Membership Class",
    completed: 45,
    inProgress: 12,
    total: 57,
    percentage: 79,
  },
  {
    name: "Leadership Development",
    completed: 18,
    inProgress: 15,
    total: 33,
    percentage: 55,
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening at Grace Community
            Church.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  ) : stat.trend === "down" ? (
                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  ) : null}
                  <span
                    className={
                      stat.trend === "up"
                        ? "text-green-500"
                        : stat.trend === "down"
                        ? "text-red-500"
                        : ""
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest member interactions and pathway progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      {activity.type === "completion" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : activity.type === "join" ? (
                        <UserPlus className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Route className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">{activity.name}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          {activity.action}{" "}
                        </span>
                        <span className="font-medium">{activity.target}</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Activity
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events scheduled for this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="space-y-2">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.date} at {event.time}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {event.attendees} attending
                      </Badge>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Calendar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pathway Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Pathway Progress</CardTitle>
            <CardDescription>
              Current status of active discipleship pathways
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {pathwayProgress.map((pathway) => (
                <div key={pathway.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{pathway.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {pathway.completed}/{pathway.total} completed
                    </div>
                  </div>
                  <Progress value={pathway.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{pathway.completed} completed</span>
                    <span>{pathway.inProgress} in progress</span>
                    <span>{pathway.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6">
              Manage Pathways
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
