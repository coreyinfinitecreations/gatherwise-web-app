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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Plus,
  MoreHorizontal,
  Users,
  Calendar,
  Heart,
  Edit,
  Trash2,
  Settings,
} from "lucide-react";

// Mock data - replace with real data from your API
const campuses = [
  {
    id: "1",
    name: "Main Campus",
    description: "Our original location in downtown",
    address: "123 Main St, City, State 12345",
    phone: "(555) 123-4567",
    email: "main@gracechurch.org",
    isActive: true,
    memberCount: 856,
    lifeGroupCount: 24,
    upcomingEvents: 8,
  },
  {
    id: "2",
    name: "North Campus",
    description: "Serving the north side of the city",
    address: "456 North Ave, City, State 12345",
    phone: "(555) 234-5678",
    email: "north@gracechurch.org",
    isActive: true,
    memberCount: 423,
    lifeGroupCount: 12,
    upcomingEvents: 5,
  },
  {
    id: "3",
    name: "Online Campus",
    description: "Virtual campus for online attendees",
    address: "Online",
    phone: null,
    email: "online@gracechurch.org",
    isActive: true,
    memberCount: 234,
    lifeGroupCount: 8,
    upcomingEvents: 3,
  },
  {
    id: "4",
    name: "South Campus",
    description: "Future location (coming soon)",
    address: "789 South Blvd, City, State 12345",
    phone: null,
    email: "south@gracechurch.org",
    isActive: false,
    memberCount: 0,
    lifeGroupCount: 0,
    upcomingEvents: 0,
  },
];

const stats = [
  {
    title: "Total Campuses",
    value: "4",
    subtitle: "3 active, 1 planned",
    icon: MapPin,
  },
  {
    title: "Total Members",
    value: "1,513",
    subtitle: "Across all campuses",
    icon: Users,
  },
  {
    title: "Total Life Groups",
    value: "44",
    subtitle: "All campuses combined",
    icon: Heart,
  },
  {
    title: "Upcoming Events",
    value: "16",
    subtitle: "Next 30 days",
    icon: Calendar,
  },
];

export default function CampusesPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Campus Management
            </h2>
            <p className="text-muted-foreground">
              Manage your church locations and campus-specific data
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Campus
          </Button>
        </div>

        {/* Stats */}
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
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Campus List */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Campus Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Campuses</CardTitle>
                <CardDescription>
                  Manage your church campuses and view their statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campus</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Life Groups</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campuses.map((campus) => (
                      <TableRow key={campus.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campus.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {campus.description}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {campus.address}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={campus.isActive ? "default" : "secondary"}
                          >
                            {campus.isActive ? "Active" : "Planned"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {campus.phone && <div>{campus.phone}</div>}
                            <div className="text-muted-foreground">
                              {campus.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">
                              {campus.memberCount}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              members
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">
                              {campus.lifeGroupCount}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              groups
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">
                              {campus.upcomingEvents}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              upcoming
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Campus
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                Campus Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Campus
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

          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Data Isolation</CardTitle>
                  <CardDescription>
                    Configure how data is shared between campuses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Shared Resources</h4>
                    <div className="text-sm text-muted-foreground">
                      • Pathways (shared across all campuses)
                      <br />
                      • Church-wide announcements
                      <br />• Global user accounts
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Campus-Specific</h4>
                    <div className="text-sm text-muted-foreground">
                      • Members and attendance
                      <br />
                      • Life Groups and events
                      <br />• Local announcements
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campus Permissions</CardTitle>
                  <CardDescription>
                    Control what campus admins can manage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Campus Admin Access</h4>
                    <div className="text-sm text-muted-foreground">
                      • Manage campus members only
                      <br />
                      • Create campus-specific events
                      <br />
                      • Manage local Life Groups
                      <br />• View campus-specific reports
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Configure Permissions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
