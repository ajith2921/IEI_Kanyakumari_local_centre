# Admin Dashboard Integration Guide

## Quick Start

This guide shows how to integrate the new admin components into existing admin pages.

---

## 1. **Adding Dashboard Statistics**

### Current Implementation
The `DashboardHome` already displays `DashboardStats` component showing real-time counts.

### Result
8-column grid showing entity counts with visual icons (members, activities, gallery, etc.)

---

## 2. **Adding Export Functionality to Admin Pages**

### Basic Integration (5 minutes)

```javascript
// AdminMembers.jsx
import AdminTableExport from "../components/AdminTableExport";

export default function AdminMembers() {
  // ... existing code ...
  const [members, setMembers] = useState([]);

  return (
    <div>
      <h2>Manage Members</h2>
      
      {/* Add export toolbar */}
      <AdminTableExport
        items={members}
        exportColumns={["id", "name", "email", "position", "image_url"]}
        entityName="members"
        loading={loading}
      />

      {/* Existing ResourceManager */}
      <ResourceManager
        title="Manage Members"
        fields={memberFields}
        fetchList={fetchMembers}
        createItem={createMember}
        updateItem={updateMember}
        deleteItem={deleteMember}
        imageUploadConfig={imageConfig}
      />
    </div>
  );
}
```

### Apply To All Admin Pages
```bash
# Files to update:
- AdminMembers.jsx
- AdminActivities.jsx
- AdminGallery.jsx
- AdminNewsletters.jsx
- AdminDownloads.jsx
- AdminFacilities.jsx
```

---

## 3. **Adding Advanced Search**

### Example with Activities

```javascript
// AdminActivities.jsx
import AdvancedSearch from "../components/AdvancedSearch";
import { useAdvancedSearch } from "../utils/searchUtils";

export default function AdminActivities() {
  const [allActivities, setAllActivities] = useState([]);
  
  // Use advanced search hook
  const { items, searchTerm, setSearchTerm, sortConfig, setSortConfig } = 
    useAdvancedSearch(allActivities, {
      searchFields: ["title", "description", "date"],
      sortField: "date",
      sortDirection: "desc",
    });

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSort = (field, direction) => {
    setSortConfig({ field, direction });
  };

  return (
    <div>
      <h2>Manage Activities</h2>
      
      {/* Advanced Search Bar */}
      <AdvancedSearch
        onSearch={handleSearch}
        searchPlaceholder="Search activities..."
        sortOptions={[
          { value: "title", label: "Title" },
          { value: "date", label: "Date" },
          { value: "created_at", label: "Created" },
        ]}
        onSortChange={handleSort}
      />

      {/* Display search results */}
      <p className="mt-4 text-sm text-gray-600">
        Found {items.length} activities
      </p>

      {/* Use filtered items in ResourceManager */}
      <ResourceManager
        items={items}
        // ... other props ...
      />
    </div>
  );
}
```

---

## 4. **Adding Date Range Filtering**

### Integration Pattern

```javascript
// AdminActivities.jsx
import DateRangeFilter from "../components/DateRangeFilter";

export default function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [filters, setFilters] = useState({});

  const handleFilterApply = (filterDates) => {
    setFilters(filterDates);
    // Optional: filter activities client-side or fetch from API
    if (filterDates.startDate && filterDates.endDate) {
      const filtered = activities.filter((a) => {
        const actDate = new Date(a.date);
        const start = new Date(filterDates.startDate);
        const end = new Date(filterDates.endDate);
        return actDate >= start && actDate <= end;
      });
      setActivities(filtered);
    }
  };

  return (
    <div>
      <h2>Manage Activities</h2>
      
      {/* Date Filter */}
      <Card className="mb-6 p-4">
        <h3 className="mb-4 font-semibold">Filters</h3>
        <DateRangeFilter onApply={handleFilterApply} />
      </Card>

      {/* Rest of component */}
    </div>
  );
}
```

---

## 5. **Analytics Dashboard**

### Display Recent Activity

```javascript
// DashboardHome.jsx (already updated)
import AdminAnalytics from "./AdminAnalytics";

export default function DashboardHome() {
  return (
    <div>
      <h2>Dashboard</h2>
      
      {/* Statistics */}
      <DashboardStats />
      
      {/* Analytics Cards */}
      <div className="mt-8">
        <h3 className="mb-4 font-semibold">Analytics</h3>
        <AdminAnalytics />
      </div>
      
      {/* Image Audit Section */}
      {/* ... existing audit code ... */}
    </div>
  );
}
```

---

## 6. **Bulk Operations with Wrapper**

### Full Featured Integration

```javascript
// AdminMembers.jsx
import AdminResourceWrapper from "./AdminResourceWrapper";

export default function AdminMembers() {
  const [members, setMembers] = useState([]);

  const handleFilterChange = (filters) => {
    // Apply date filters to API request
    console.log("Applying filters:", filters);
  };

  return (
    <AdminResourceWrapper
      title="Manage Members"
      items={members}
      exportColumns={["id", "name", "email", "position"]}
      entityName="members"
      onFilterChange={handleFilterChange}
    >
      <ResourceManager
        title="Manage Members"
        fields={memberFields}
        fetchList={fetchMembers}
        createItem={createMember}
        updateItem={updateMember}
        deleteItem={deleteMember}
        imageUploadConfig={imageConfig}
      />
    </AdminResourceWrapper>
  );
}
```

---

## Export Columns Reference

### Members
```javascript
["id", "name", "email", "position", "phone", "image_url"]
```

### Activities
```javascript
["id", "title", "description", "date", "location", "image_url"]
```

### Gallery
```javascript
["id", "title", "description", "image_url", "created_at"]
```

### Newsletters
```javascript
["id", "subject", "content", "sent_at", "recipient_count"]
```

### Downloads
```javascript
["id", "title", "description", "file_url", "downloads_count"]
```

### Facilities
```javascript
["id", "name", "description", "image_url", "created_at"]
```

---

## Feature Checklist

### For Each Admin Page

- [ ] Import export component
- [ ] Add AdminTableExport above ResourceManager
- [ ] Define export columns
- [ ] Test CSV export
- [ ] Test JSON export

### Search Integration

- [ ] Import AdvancedSearch component
- [ ] Import useAdvancedSearch hook
- [ ] Configure search fields
- [ ] Configure sort options
- [ ] Implement search handler

### Filter Integration

- [ ] Import DateRangeFilter
- [ ] Add date range state
- [ ] Implement filter handler
- [ ] Apply filters to data

---

## API Integration

### Pagination Already Supports
```
GET /api/members?page=1&limit=20
GET /api/activities?page=1&limit=10
GET /api/gallery?page=1&limit=12
GET /api/conferences?page=1&limit=10
```

### Date Filtering (Backend Ready)
Add to API routes when needed:
```python
@router.get("/activities")
def list_activities(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    start_date: Optional[str] = None,  # Format: YYYY-MM-DD
    end_date: Optional[str] = None,    # Format: YYYY-MM-DD
):
    # Filter logic here
    pass
```

---

## Performance Tips

1. **Use Pagination**: Load pages of 10-25 items
2. **Cache Results**: Use 5-minute cache for lists
3. **Lazy Load**: Load export data on demand
4. **Batch Operations**: Export before deleting many items
5. **Monitor**: Check browser DevTools Network tab

---

## Common Patterns

### Complete Admin Page Example

```javascript
import { useState, useEffect } from "react";
import ResourceManager from "./ResourceManager";
import AdminTableExport from "../components/AdminTableExport";
import AdvancedSearch from "../components/AdvancedSearch";
import DateRangeFilter from "../components/DateRangeFilter";
import { adminApi } from "../services/api";

export default function AdminExample() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const response = await adminApi.example.list();
    setItems(response.data);
    setFilteredItems(response.data);
    setLoading(false);
  };

  const handleSearch = (term) => {
    // Implement search
  };

  const handleFilter = (filters) => {
    // Implement filtering
  };

  return (
    <div>
      <h2>Manage Example</h2>

      {/* Search */}
      <AdvancedSearch
        onSearch={handleSearch}
        searchPlaceholder="Search..."
        sortOptions={[...]}
      />

      {/* Filters */}
      <DateRangeFilter onApply={handleFilter} />

      {/* Export */}
      <AdminTableExport
        items={filteredItems}
        exportColumns={[...]}
        entityName="example"
      />

      {/* Manager */}
      <ResourceManager {...props} />
    </div>
  );
}
```

---

## Troubleshooting

### Export not working?
- Check browser console for errors
- Verify export columns match data object keys
- Test with small dataset first

### Search not filtering?
- Verify searchFields array includes correct field names
- Test with known values
- Check browser DevTools Network tab

### Sort not updating?
- Verify sortOptions have correct values
- Check sortConfig state updates
- Test with simple data first

---

## Next Steps

1. **Integrate Export** into all admin pages (1-2 hours)
2. **Add Search** to complex lists (1-2 hours)
3. **Enable Filtering** by date range (1 hour)
4. **Setup Analytics** dashboard (30 mins)
5. **Test** all features across browsers (1 hour)

**Total Integration Time**: ~5-7 hours
**Complexity**: Medium
**Impact**: High (significantly improves admin UX)
