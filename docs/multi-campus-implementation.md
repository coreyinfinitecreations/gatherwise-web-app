# Multi-Campus Implementation Guide

## Overview

This implementation provides a comprehensive multi-campus architecture for Gatherwise, allowing churches with multiple locations to manage campus-specific data while maintaining church-wide coordination.

## Architecture Design

### 1. Database Schema Changes

#### New Models Added:

- **Campus**: Represents individual campus locations
- **LifeGroup**: Campus-specific life groups
- **Event**: Campus-specific events
- **EventRegistration**: Event registration tracking

#### Modified Models:

- **ChurchMember**: Added optional `campusId` for campus assignment
- **Pathway**: Added optional `campusId` (can be campus-specific or church-wide)

### 2. Data Isolation Strategy

#### Campus-Specific Data:

- Members and attendance
- Life Groups and their members
- Events and registrations
- Local announcements

#### Church-Wide Data:

- User accounts (can belong to multiple campuses)
- Discipleship pathways (shared or campus-specific)
- Global church settings
- System-wide announcements

## Frontend Implementation

### 1. Campus Context Provider

The `CampusProvider` manages the current campus selection and provides:

- Current campus state
- Available campuses list
- Campus switching functionality
- Persistent campus selection (localStorage)

### 2. Campus Selector Component

Located in the dashboard header, allows users to:

- View current campus
- Switch between available campuses
- See campus descriptions and details

### 3. Campus-Aware Data Filtering

The `useCampusFilter` hook provides:

- API parameter generation for campus-filtered queries
- Local data filtering by campus
- Display context for current selection

## Usage Examples

### 1. Making a Page Campus-Aware

```tsx
import { useCampusFilter } from "@/hooks/use-campus-filter";

export default function LifeGroupsPage() {
  const { filterByCampus, getDisplayContext } = useCampusFilter({
    includeCampusData: true,
    includeChurchWideData: false,
  });

  const { campusName } = getDisplayContext();

  // Filter life groups by current campus
  const campusLifeGroups = filterByCampus(allLifeGroups);

  return (
    <div>
      <h1>Life Groups - {campusName}</h1>
      {/* Rest of component */}
    </div>
  );
}
```

### 2. API Integration

```tsx
// Example API call with campus filtering
const { getFilterParams } = useCampusFilter();

const fetchMembers = async () => {
  const params = getFilterParams();
  const response = await fetch("/api/members?" + new URLSearchParams(params));
  return response.json();
};
```

## Permission Levels

### 1. Super Admin

- Access to all campuses
- Can create/edit/delete campuses
- Manage church-wide settings

### 2. Church Admin

- Access to all campuses within their church
- Can switch between campuses
- Manage church-wide pathways and announcements

### 3. Campus Admin

- Limited to their specific campus
- Cannot switch campuses
- Manage campus-specific data only

### 4. Campus Leaders/Members

- View their campus data only
- No campus switching
- Limited management permissions

## Implementation Status

### ✅ Completed

- Database schema updates with Campus model
- Campus context provider and selector
- Campus management page for admins
- Navigation integration
- Campus filtering utilities

### ⏳ Next Steps

1. **Update existing pages** to use campus filtering:

   - People management
   - Events management
   - Life Groups (partially done)
   - Reports and analytics

2. **API Development**:

   - Campus CRUD operations
   - Campus-filtered data endpoints
   - Permission middleware

3. **Authentication Integration**:

   - Campus-based permissions
   - Role-based campus access
   - User campus assignments

4. **Data Migration**:
   - Create initial campus records
   - Assign existing data to campuses
   - Set up default campus assignments

## Campus Switching Behavior

When a user switches campuses:

1. Selection saved to localStorage
2. Page refreshes to load new campus data
3. All data views update to show selected campus
4. Navigation context updates with campus name

## Best Practices

### 1. Data Querying

- Always consider campus context when fetching data
- Use the `useCampusFilter` hook for consistent filtering
- Provide clear indicators of which campus data is displayed

### 2. User Experience

- Show current campus in the header
- Provide easy campus switching for multi-campus users
- Use consistent campus indicators throughout the UI

### 3. Performance

- Cache campus list to avoid repeated API calls
- Implement efficient campus-filtered queries
- Consider pagination for large campus datasets

## Migration Strategy

### Phase 1: Infrastructure

- ✅ Database schema updates
- ✅ Context providers and UI components
- ✅ Basic campus management

### Phase 2: Feature Updates

- Update all dashboard pages for campus awareness
- Implement API endpoints with campus filtering
- Add permission-based campus access

### Phase 3: Data Migration

- Create campus records for existing churches
- Assign existing members/groups to default campus
- Set up user campus permissions

### Phase 4: Advanced Features

- Campus-specific reporting and analytics
- Cross-campus pathway sharing
- Advanced permission management
- Campus performance comparisons

This architecture provides a solid foundation for multi-campus church management while maintaining flexibility for different organizational structures and growth patterns.
