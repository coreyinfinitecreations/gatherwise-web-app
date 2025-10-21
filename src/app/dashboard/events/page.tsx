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
  Calendar,
  Users,
  MapPin,
  Clock,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  UserPlus,
  MessageSquare,
} from "lucide-react";

const upcomingEvents = [
  {
    id: 1,
    title: "Sunday Worship Service",
    date: "March 24, 2024",
    time: "10:00 AM",
    location: "Main Sanctuary",
    attendees: 245,
    registered: 0,
    type: "Worship",
    status: "Published",
    recurring: true,
    description: "Join us for inspiring worship and fellowship",
  },
  {
    id: 2,
    title: "Community Easter Egg Hunt",
    date: "March 30, 2024",
    time: "2:00 PM",
    location: "Church Grounds",
    attendees: 0,
    registered: 47,
    type: "Family",
    status: "Published",
    recurring: false,
    description: "Fun Easter celebration for the whole family",
  },
  {
    id: 3,
    title: "Youth Group Meeting",
    date: "March 26, 2024",
    time: "7:00 PM",
    location: "Youth Room",
    attendees: 0,
    registered: 23,
    type: "Youth",
    status: "Published",
    recurring: true,
    description: "Weekly youth fellowship and Bible study",
  },
  {
    id: 4,
    title: "Volunteer Training",
    date: "March 28, 2024",
    time: "6:30 PM",
    location: "Conference Room",
    attendees: 0,
    registered: 12,
    type: "Training",
    status: "Draft",
    recurring: false,
    description: "Training session for new volunteers",
  },
];

const pastEvents = [
  {
    id: 5,
    title: "Women's Conference",
    date: "March 16, 2024",
    attendees: 89,
    feedback: 4.8,
    type: "Conference",
  },
  {
    id: 6,
    title: "Men's Breakfast",
    date: "March 9, 2024",
    attendees: 34,
    feedback: 4.6,
    type: "Fellowship",
  },
  {
    id: 7,
    title: "Community Service Day",
    date: "March 2, 2024",
    attendees: 67,
    feedback: 4.9,
    type: "Service",
  },
];

const eventStats = {
  totalEvents: 28,
  thisMonth: 8,
  totalAttendees: 1247,
  avgAttendance: 89,
  upcomingEvents: 12,
  registrationOpen: 4,
};

export default function EventsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">
              Manage church events, registrations, and attendance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar View
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventStats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {eventStats.thisMonth} this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Events
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {eventStats.upcomingEvents}
              </div>
              <p className="text-xs text-muted-foreground">
                {eventStats.registrationOpen} with open registration
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Attendees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {eventStats.totalAttendees.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Attendance
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {eventStats.avgAttendance}
              </div>
              <p className="text-xs text-muted-foreground">Per event</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Upcoming Events Tab */}
          <TabsContent value="upcoming">
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            {event.title}
                          </CardTitle>
                          <Badge
                            variant={
                              event.status === "Published"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {event.status}
                          </Badge>
                          {event.recurring && (
                            <Badge variant="outline">Recurring</Badge>
                          )}
                        </div>
                        <CardDescription>{event.description}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Manage Registration
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate Event
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Public Page
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancel Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Date & Time
                        </div>
                        <div>
                          <div className="font-medium">{event.date}</div>
                          <div className="text-sm text-muted-foreground">
                            {event.time}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          Location
                        </div>
                        <div className="font-medium">{event.location}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {event.registered > 0
                            ? "Registered"
                            : "Expected Attendance"}
                        </div>
                        <div className="font-medium">
                          {event.registered > 0
                            ? `${event.registered} registered`
                            : `${event.attendees} people`}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Event Type
                        </div>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      {event.registered > 0 && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Users className="h-3 w-3" />
                          View Registrations
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="gap-2">
                        <MessageSquare className="h-3 w-3" />
                        Send Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Past Events Tab */}
          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Past Events</CardTitle>
                <CardDescription>
                  Review attendance and feedback from completed events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          {event.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {event.date}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.type}</Badge>
                        </TableCell>
                        <TableCell>{event.attendees} people</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span>{event.feedback}/5.0</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Users className="mr-2 h-4 w-4" />
                                View Attendees
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                View Feedback
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Create Similar Event
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trends</CardTitle>
                  <CardDescription>
                    Event attendance over the past 6 months
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
                  <CardTitle>Event Types</CardTitle>
                  <CardDescription>
                    Distribution of event types and their popularity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Worship Services</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fellowship Events</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Youth Activities</span>
                      <span className="font-medium">15%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Community Service</span>
                      <span className="font-medium">10%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Other</span>
                      <span className="font-medium">5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Registration Performance</CardTitle>
                  <CardDescription>
                    How well events are filling up
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Easter Egg Hunt</span>
                        <span>94% (47/50)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: "94%" }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Youth Group</span>
                        <span>77% (23/30)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: "77%" }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Volunteer Training</span>
                        <span>60% (12/20)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: "60%" }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Times</CardTitle>
                  <CardDescription>
                    Most popular days and times for events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Best Days</div>
                      <div className="text-sm text-muted-foreground">
                        Sunday (68%), Saturday (24%), Wednesday (8%)
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Peak Times</div>
                      <div className="text-sm text-muted-foreground">
                        10:00 AM (35%), 7:00 PM (28%), 2:00 PM (22%)
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Average Duration
                      </div>
                      <div className="text-sm text-muted-foreground">
                        1.5 hours
                      </div>
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
