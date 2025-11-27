"use client";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
import { useState } from "react";

type PersonType = "Member" | "Staff" | "Visitor";

type UserRole = "SUPER_ADMIN" | "CHURCH_ADMIN" | "PASTOR" | "LEADER" | "MEMBER";

interface Person {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: PersonType;
  joinDate?: string;
  visitDate?: string;
  role?: string;
  department?: string;
  permission?: UserRole;
  status?: string;
  pathway?: string;
  pathwayStep?: number;
  pathwayTotal?: number;
  interests?: string[];
  groups?: string[];
  avatar?: string;
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [filterType, setFilterType] = useState<
    "all" | "members" | "visitors" | "staff"
  >("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newPerson, setNewPerson] = useState({
    name: "",
    email: "",
    phone: "",
    type: "Member" as PersonType,
    role: "",
    department: "",
    permission: "MEMBER" as UserRole,
  });

  const handleAddPerson = () => {
    if (!newPerson.name || !newPerson.email) {
      alert("Please fill in name and email");
      return;
    }

    const person: Person = {
      id: Date.now().toString(),
      name: newPerson.name,
      email: newPerson.email,
      phone: newPerson.phone || undefined,
      type: newPerson.type,
      permission: newPerson.type === "Staff" ? newPerson.permission : "MEMBER",
      ...(newPerson.type === "Member" && {
        joinDate: new Date().toISOString().split("T")[0],
        status: "Active",
      }),
      ...(newPerson.type === "Visitor" && {
        visitDate: new Date().toISOString().split("T")[0],
        status: "Pending",
      }),
      ...(newPerson.type === "Staff" && {
        role: newPerson.role,
        department: newPerson.department,
        joinDate: new Date().toISOString().split("T")[0],
      }),
    };

    setPeople([...people, person]);
    setNewPerson({
      name: "",
      email: "",
      phone: "",
      type: "Member",
      role: "",
      department: "",
      permission: "MEMBER",
    });
    setIsDialogOpen(false);
  };

  const filteredPeople = people
    .filter((person) => {
      if (filterType === "all") return true;
      if (filterType === "members") return person.type === "Member";
      if (filterType === "visitors") return person.type === "Visitor";
      if (filterType === "staff") return person.type === "Staff";
      return true;
    })
    .filter((person) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        person.name.toLowerCase().includes(query) ||
        person.email.toLowerCase().includes(query) ||
        person.phone?.toLowerCase().includes(query)
      );
    });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">People</h1>
            <p className="text-muted-foreground">
              Manage your church members, staff, and visitors
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Person
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Person</DialogTitle>
                <DialogDescription>
                  Add a new member, staff member, or visitor to your church
                  directory.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Person Type</Label>
                  <Select
                    value={newPerson.type}
                    onValueChange={(value: PersonType) =>
                      setNewPerson({ ...newPerson, type: value })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Member">Member</SelectItem>
                      <SelectItem value="Visitor">Visitor</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={newPerson.name}
                    onChange={(e) =>
                      setNewPerson({ ...newPerson, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={newPerson.email}
                    onChange={(e) =>
                      setNewPerson({ ...newPerson, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={newPerson.phone}
                    onChange={(e) =>
                      setNewPerson({ ...newPerson, phone: e.target.value })
                    }
                  />
                </div>
                {newPerson.type === "Staff" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        placeholder="e.g., Youth Pastor"
                        value={newPerson.role}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, role: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        placeholder="e.g., Youth Ministry"
                        value={newPerson.department}
                        onChange={(e) =>
                          setNewPerson({
                            ...newPerson,
                            department: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="permission">Permission Level</Label>
                      <Select
                        value={newPerson.permission}
                        onValueChange={(value: UserRole) =>
                          setNewPerson({ ...newPerson, permission: value })
                        }
                      >
                        <SelectTrigger id="permission">
                          <SelectValue placeholder="Select permission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="LEADER">Leader</SelectItem>
                          <SelectItem value="PASTOR">Pastor</SelectItem>
                          <SelectItem value="CHURCH_ADMIN">
                            Church Admin
                          </SelectItem>
                          <SelectItem value="SUPER_ADMIN">
                            Super Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddPerson}>Add Person</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            placeholder="Search people..."
            className="pl-10 pr-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setFilterType("all")}>
                <div className="flex items-center justify-between w-full">
                  <span>All People</span>
                  {filterType === "all" && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("members")}>
                <div className="flex items-center justify-between w-full">
                  <span>Members</span>
                  {filterType === "members" && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("visitors")}>
                <div className="flex items-center justify-between w-full">
                  <span>Visitors</span>
                  {filterType === "visitors" && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("staff")}>
                <div className="flex items-center justify-between w-full">
                  <span>Staff</span>
                  {filterType === "staff" && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* People Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filterType === "all" && "All People"}
              {filterType === "members" && "Church Members"}
              {filterType === "visitors" && "Recent Visitors"}
              {filterType === "staff" && "Church Staff"}
            </CardTitle>
            <CardDescription>
              {filterType === "all" &&
                "View all members, staff, and visitors in one place"}
              {filterType === "members" &&
                "Manage your active church members and their pathway progress"}
              {filterType === "visitors" &&
                "Track and follow up with church visitors"}
              {filterType === "staff" &&
                "Manage your church staff members and leadership team"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPeople.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No people found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "No results match your search. Try a different query."
                    : "Get started by adding your first person to the directory."}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Person
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPeople.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={person.avatar} />
                            <AvatarFallback>
                              {person.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{person.name}</div>
                            {person.joinDate && (
                              <div className="text-sm text-muted-foreground">
                                Joined{" "}
                                {new Date(person.joinDate).toLocaleDateString()}
                              </div>
                            )}
                            {person.visitDate && (
                              <div className="text-sm text-muted-foreground">
                                Visited{" "}
                                {new Date(
                                  person.visitDate
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{person.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {person.email}
                          </div>
                          {person.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {person.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {person.role && (
                          <div className="text-sm">
                            <div className="font-medium">{person.role}</div>
                            {person.department && (
                              <div className="text-muted-foreground">
                                {person.department}
                              </div>
                            )}
                            {person.permission && (
                              <Badge variant="secondary" className="mt-1">
                                {person.permission.replace("_", " ")}
                              </Badge>
                            )}
                          </div>
                        )}
                        {person.pathway && (
                          <div className="text-sm">
                            <div className="font-medium">{person.pathway}</div>
                            <div className="text-muted-foreground">
                              Step {person.pathwayStep} of {person.pathwayTotal}
                            </div>
                          </div>
                        )}
                        {person.interests && person.interests.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {person.interests.map((interest) => (
                              <Badge
                                key={interest}
                                variant="secondary"
                                className="text-xs"
                              >
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {person.status && !person.role && (
                          <Badge variant="secondary">{person.status}</Badge>
                        )}
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
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                            {person.type === "Member" && (
                              <DropdownMenuItem>View Progress</DropdownMenuItem>
                            )}
                            {person.type === "Visitor" && (
                              <DropdownMenuItem>
                                Convert to Member
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
