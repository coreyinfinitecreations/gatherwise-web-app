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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Users,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Calendar,
  MapPin,
  Clock,
  Heart,
  BookOpen,
  Coffee,
  Home,
  Phone,
  Mail,
  MessageSquare,
} from "lucide-react";

const lifeGroups = [
  {
    id: 1,
    name: "Young Professionals",
    leader: "Sarah Johnson",
    coLeader: "Mike Chen",
    members: 12,
    capacity: 15,
    meetingDay: "Thursday",
    meetingTime: "7:00 PM",
    location: "Sarah's Home",
    address: "123 Oak Street",
    focus: "Career & Faith",
    status: "Active",
    lastMeeting: "2 days ago",
    nextMeeting: "March 21, 2024",
    description: "A group for young professionals navigating career and faith",
    contact: {
      phone: "(555) 123-4567",
      email: "sarah.johnson@email.com",
    },
  },
  {
    id: 2,
    name: "Families with Kids",
    leader: "David Rodriguez",
    coLeader: "Lisa Rodriguez",
    members: 8,
    capacity: 12,
    meetingDay: "Sunday",
    meetingTime: "5:00 PM",
    location: "Church Building",
    address: "Room 201",
    focus: "Parenting & Faith",
    status: "Active",
    lastMeeting: "5 days ago",
    nextMeeting: "March 24, 2024",
    description:
      "Supporting families in raising children with Christian values",
    contact: {
      phone: "(555) 234-5678",
      email: "david.rodriguez@email.com",
    },
  },
  {
    id: 3,
    name: "Senior Saints",
    leader: "Robert Thompson",
    coLeader: "Mary Thompson",
    members: 15,
    capacity: 20,
    meetingDay: "Tuesday",
    meetingTime: "10:00 AM",
    location: "Fellowship Hall",
    address: "Church Building",
    focus: "Bible Study",
    status: "Active",
    lastMeeting: "1 day ago",
    nextMeeting: "March 26, 2024",
    description: "Mature believers studying God's word together",
    contact: {
      phone: "(555) 345-6789",
      email: "robert.thompson@email.com",
    },
  },
  {
    id: 4,
    name: "College & Career",
    leader: "Emma Wilson",
    coLeader: "James Park",
    members: 6,
    capacity: 15,
    meetingDay: "Friday",
    meetingTime: "7:30 PM",
    location: "Coffee Shop",
    address: "Downtown Café",
    focus: "Life Transitions",
    status: "Growing",
    lastMeeting: "3 days ago",
    nextMeeting: "March 22, 2024",
    description: "Young adults navigating college and early career decisions",
    contact: {
      phone: "(555) 456-7890",
      email: "emma.wilson@email.com",
    },
  },
];

const groupMembers = [
  {
    id: 1,
    name: "John Smith",
    group: "Young Professionals",
    role: "Member",
    joinDate: "Jan 2024",
    attendance: 85,
    status: "Active",
  },
  {
    id: 2,
    name: "Amy Davis",
    group: "Families with Kids",
    role: "Member",
    joinDate: "Feb 2024",
    attendance: 92,
    status: "Active",
  },
  {
    id: 3,
    name: "Mark Johnson",
    group: "Senior Saints",
    role: "Member",
    joinDate: "Nov 2023",
    attendance: 78,
    status: "Active",
  },
];

const lifeGroupStats = {
  totalGroups: 12,
  activeGroups: 10,
  totalMembers: 147,
  averageSize: 12,
  averageAttendance: 84,
  newGroupsThisMonth: 2,
};

export default function LifeGroupsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Life Groups</h1>
            <p className="text-muted-foreground">
              Manage small groups, track attendance, and foster community
              connections
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule View
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Groups
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lifeGroupStats.totalGroups}
              </div>
              <p className="text-xs text-muted-foreground">
                {lifeGroupStats.activeGroups} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Members
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lifeGroupStats.totalMembers}
              </div>
              <p className="text-xs text-muted-foreground">Across all groups</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Size
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lifeGroupStats.averageSize}
              </div>
              <p className="text-xs text-muted-foreground">Members per group</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Attendance
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lifeGroupStats.averageAttendance}%
              </div>
              <p className="text-xs text-muted-foreground">Weekly attendance</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="groups" className="space-y-6">
          <TabsList>
            <TabsTrigger value="groups">All Groups</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* All Groups Tab */}
          <TabsContent value="groups">
            <div className="grid gap-6">
              {lifeGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">
                            {group.name}
                          </CardTitle>
                          <Badge
                            variant={
                              group.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {group.status}
                          </Badge>
                        </div>
                        <CardDescription>{group.description}</CardDescription>
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
                            Edit Group
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Members
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            View Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Archive Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          Leadership
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {group.leader
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">
                                {group.leader}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Leader
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {group.coLeader
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">
                                {group.coLeader}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Co-Leader
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          Membership
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current Members</span>
                            <span>
                              {group.members}/{group.capacity}
                            </span>
                          </div>
                          <Progress
                            value={(group.members / group.capacity) * 100}
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            {group.capacity - group.members} spots available
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          Meeting Details
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3" />
                            {group.meetingDay}s at {group.meetingTime}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3" />
                            {group.location}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {group.address}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          Contact Info
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {group.contact.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {group.contact.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div>Focus: {group.focus}</div>
                        <div>Last meeting: {group.lastMeeting}</div>
                        <div>Next meeting: {group.nextMeeting}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Users className="h-3 w-3" />
                          View Members
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <MessageSquare className="h-3 w-3" />
                          Message Group
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Group Members</CardTitle>
                <CardDescription>
                  Manage members across all life groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.name}
                        </TableCell>
                        <TableCell>{member.group}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.joinDate}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={member.attendance}
                              className="w-16 h-2"
                            />
                            <span className="text-sm">
                              {member.attendance}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{member.status}</Badge>
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
                                <Edit className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Change Group
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove from Group
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

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>
                    Life group meeting schedule overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ].map((day) => {
                      const groupsOnDay = lifeGroups.filter(
                        (group) => group.meetingDay === day
                      );
                      return (
                        <div
                          key={day}
                          className="flex items-center justify-between py-2 border-b"
                        >
                          <div className="font-medium">{day}</div>
                          <div className="flex gap-2">
                            {groupsOnDay.length > 0 ? (
                              groupsOnDay.map((group) => (
                                <Badge
                                  key={group.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {group.name} - {group.meetingTime}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                No meetings
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Meetings</CardTitle>
                  <CardDescription>
                    Next scheduled life group meetings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lifeGroups.slice(0, 4).map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {group.nextMeeting} at {group.meetingTime}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {group.location}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {group.members} members
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Led by {group.leader}
                          </div>
                        </div>
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
                  <CardTitle>Group Growth</CardTitle>
                  <CardDescription>
                    Life group membership trends over time
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
                  <CardTitle>Attendance Patterns</CardTitle>
                  <CardDescription>
                    Weekly attendance across all groups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lifeGroups.map((group) => (
                      <div key={group.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">
                            {group.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round(group.members * 0.85)} avg.
                          </div>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Group Health</CardTitle>
                  <CardDescription>
                    Overall life group health metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Groups at Capacity</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Group Age</span>
                      <span className="font-medium">18 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Leader Retention</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">New Groups This Year</span>
                      <span className="font-medium">6</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Meeting Locations</CardTitle>
                  <CardDescription>
                    Distribution of meeting venues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <span className="text-sm">Home Groups</span>
                      </div>
                      <span className="font-medium">60%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="text-sm">Church Building</span>
                      </div>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coffee className="h-4 w-4" />
                        <span className="text-sm">Public Venues</span>
                      </div>
                      <span className="font-medium">10%</span>
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
