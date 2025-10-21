import DashboardLayout from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";

const members = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    joinDate: "2024-03-15",
    status: "Active",
    groups: ["Young Adults", "Worship Team"],
    pathway: "Leadership Development",
    pathwayStep: 3,
    pathwayTotal: 5,
    avatar: "/avatars/sarah.jpg",
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike.chen@email.com",
    phone: "(555) 234-5678",
    joinDate: "2024-01-20",
    status: "Active",
    groups: ["Men's Ministry"],
    pathway: "Membership Class",
    pathwayStep: 2,
    pathwayTotal: 3,
    avatar: "/avatars/mike.jpg",
  },
  {
    id: 3,
    name: "Lisa Rodriguez",
    email: "lisa.rodriguez@email.com",
    phone: "(555) 345-6789",
    joinDate: "2024-02-10",
    status: "Active",
    groups: ["Women's Bible Study", "Children's Ministry"],
    pathway: "Newcomer Pathway",
    pathwayStep: 4,
    pathwayTotal: 4,
    avatar: "/avatars/lisa.jpg",
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@email.com",
    phone: "(555) 456-7890",
    joinDate: "2024-04-05",
    status: "Visitor",
    groups: [],
    pathway: "Visitor Experience",
    pathwayStep: 1,
    pathwayTotal: 3,
    avatar: "/avatars/david.jpg",
  },
];

const visitors = [
  {
    id: 1,
    name: "Jennifer Adams",
    email: "jennifer.adams@email.com",
    visitDate: "2024-10-13",
    followUpStatus: "Pending",
    interests: ["Small Groups", "Volunteer Opportunities"],
  },
  {
    id: 2,
    name: "Robert Wilson",
    email: "robert.wilson@email.com",
    visitDate: "2024-10-06",
    followUpStatus: "Contacted",
    interests: ["Men's Ministry", "Bible Study"],
  },
];

const lifeGroups = [
  {
    id: 1,
    name: "Young Adults",
    leader: "Sarah Johnson",
    members: 24,
    meetingTime: "Fridays 7:00 PM",
    location: "Church Building - Room 202",
    status: "Active",
  },
  {
    id: 2,
    name: "Men's Ministry",
    leader: "Pastor John",
    members: 18,
    meetingTime: "Saturdays 8:00 AM",
    location: "Fellowship Hall",
    status: "Active",
  },
  {
    id: 3,
    name: "Women's Bible Study",
    leader: "Mary Thompson",
    members: 32,
    meetingTime: "Wednesdays 10:00 AM",
    location: "Church Building - Room 105",
    status: "Active",
  },
];

export default function PeoplePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">People</h1>
            <p className="text-muted-foreground">
              Manage your church members, visitors, and life groups
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search members..." className="pl-10" />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="visitors">Visitors</TabsTrigger>
            <TabsTrigger value="groups">Life Groups</TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Church Members</CardTitle>
                <CardDescription>
                  Manage your active church members and their pathway progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Groups</TableHead>
                      <TableHead>Pathway Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Joined{" "}
                                {new Date(member.joinDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {member.groups.map((group) => (
                              <Badge
                                key={group}
                                variant="secondary"
                                className="text-xs"
                              >
                                {group}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {member.pathway}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Step {member.pathwayStep} of {member.pathwayTotal}
                            </div>
                            <div className="w-24 bg-muted rounded-full h-1">
                              <div
                                className="bg-primary h-1 rounded-full transition-all"
                                style={{
                                  width: `${
                                    (member.pathwayStep / member.pathwayTotal) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Edit Member</DropdownMenuItem>
                              <DropdownMenuItem>Send Message</DropdownMenuItem>
                              <DropdownMenuItem>View Progress</DropdownMenuItem>
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

          {/* Visitors Tab */}
          <TabsContent value="visitors">
            <Card>
              <CardHeader>
                <CardTitle>Recent Visitors</CardTitle>
                <CardDescription>
                  Track and follow up with church visitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Visit Date</TableHead>
                      <TableHead>Interests</TableHead>
                      <TableHead>Follow-up Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitors.map((visitor) => (
                      <TableRow key={visitor.id}>
                        <TableCell className="font-medium">
                          {visitor.name}
                        </TableCell>
                        <TableCell>{visitor.email}</TableCell>
                        <TableCell>
                          {new Date(visitor.visitDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {visitor.interests.map((interest) => (
                              <Badge
                                key={interest}
                                variant="outline"
                                className="text-xs"
                              >
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              visitor.followUpStatus === "Contacted"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {visitor.followUpStatus}
                          </Badge>
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
                                Contact Visitor
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Add to Pathway
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Convert to Member
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

          {/* Life Groups Tab */}
          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle>Life Groups</CardTitle>
                <CardDescription>
                  Manage your church&apos;s small groups and life groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Group Name</TableHead>
                      <TableHead>Leader</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Meeting Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lifeGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">
                          {group.name}
                        </TableCell>
                        <TableCell>{group.leader}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {group.members}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3" />
                              {group.meetingTime}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {group.location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{group.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Group</DropdownMenuItem>
                              <DropdownMenuItem>Edit Group</DropdownMenuItem>
                              <DropdownMenuItem>
                                Manage Members
                              </DropdownMenuItem>
                              <DropdownMenuItem>Send Message</DropdownMenuItem>
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
