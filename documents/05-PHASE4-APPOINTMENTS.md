# Phase 4: Appointment Management System

## Objective
Implement comprehensive appointment scheduling, calendar view, and appointment tracking for efficient clinic operations.

---

## Features to Implement

### A. Appointment Scheduling

#### Schedule New Appointment

**Access Points**:
1. From Patient Detail: "Schedule Appointment" button
2. From Appointments page: "New Appointment" button
3. From Dashboard: "Quick Schedule" widget
4. From Calendar view: Click on time slot

**Appointment Form**:

**Patient Selection**:
- **If from patient detail**: Patient auto-selected, read-only
- **If from appointments page**: 
  - Search patient (autocomplete by name, ID, phone)
  - Or "New Patient" button (quick registration + appointment)

**Appointment Details**:

**Date & Time** (required):
- Date: (date picker, cannot be in past)
- Time: (time picker, 15-minute intervals)
  - Default clinic hours: 9:00 AM - 6:00 PM
  - Configurable in settings
- Duration: (dropdown)
  - 15 minutes
  - 30 minutes (default)
  - 45 minutes
  - 60 minutes
  - Custom

**Appointment Type** (dropdown, required):
- New Patient Consultation
- Follow-up Visit
- Routine Check-up
- Emergency
- Post-operative Review
- Contact Lens Fitting
- Custom

**Assigned Doctor** (dropdown):
- Default: Current logged-in doctor
- Can assign to other doctors (if admin)

**Reason for Visit** (text area, optional):
- Chief complaint
- Patient's description of issue

**Patient Contact Confirmation**:
- [ ] Patient confirmed by phone
- [ ] Patient confirmed by SMS/WhatsApp
- [ ] Reminder sent

**Notes** (text area, optional):
- Internal notes for receptionist/doctor
- Special requirements

**Save Options**:
- **Save Appointment**: Create appointment
- **Save & Print**: Create and print appointment slip
- **Save & Send Reminder**: Create and send confirmation (future)
- **Cancel**: Discard

---

#### Appointment Validation

**Conflict Checking**:
- Check for overlapping appointments
- Show warning if doctor has another appointment at same time
- Show warning if patient has appointment on same day
- Option to override (with reason)

**Business Rules**:
- Cannot book in past
- Cannot book outside clinic hours (configurable)
- Maximum appointments per day (configurable, default: 40)
- Minimum notice period (default: 1 hour ahead)

---

### B. Calendar Views

#### Daily Calendar View

**Layout**:
- Time slots from 9:00 AM to 6:00 PM (rows)
- Doctors (columns if multiple doctors)
- Grid showing appointment blocks

**Time Grid**:
```
       │ Dr. Smith    │ Dr. Johnson  │
───────┼──────────────┼──────────────┤
09:00  │ [Appt]       │              │
09:30  │ [Appt cont.] │ [Appt]       │
10:00  │              │              │
10:30  │ [Appt]       │ [Appt]       │
11:00  │ [Appt]       │ [Appt cont.] │
...
```

**Appointment Block Display**:
- Patient Name
- Appointment Type (icon or color code)
- Duration (visual height)
- Status indicator (dot or border color)

**Color Coding**:
- Scheduled: Blue
- Confirmed: Green
- Completed: Gray
- Cancelled: Red strikethrough
- No-show: Orange
- In Progress: Yellow

**Interactions**:
- Click appointment: View details
- Click empty slot: Quick schedule
- Drag & drop: Reschedule (with confirmation)
- Right-click: Context menu (view, edit, cancel, mark complete)

**Navigation**:
- Today button
- Previous/Next day arrows
- Date picker

---

#### Weekly Calendar View

**Layout**:
- 7-day week view
- Days as columns
- Time slots as rows
- Compact appointment blocks

**Features**:
- Overview of week's schedule
- Scroll horizontally for time, vertically for days
- Filter by doctor
- Color-coded by status
- Click any day to switch to daily view

---

#### Monthly Calendar View

**Layout**:
- Standard month calendar grid
- Appointment count badges on each date
- Color indicators for appointment density

**Date Cell Display**:
```
┌────────────┐
│ 15         │  ← Date
│ ●●●●● (8)  │  ← Appointment indicators (count)
│            │
└────────────┘
```

**Features**:
- Click date: Go to daily view for that date
- Hover: Show appointment count tooltip
- Color intensity: Indicates busyness (light=few, dark=many)

**Navigation**:
- Today button
- Previous/Next month arrows
- Month/Year picker

---

### C. Appointment List View

#### Appointments Page (List)

**Filters** (top bar):
- Date Range: (from/to date pickers)
- Status: (multi-select)
  - All
  - Scheduled
  - Confirmed
  - Completed
  - Cancelled
  - No-show
- Doctor: (dropdown)
- Appointment Type: (dropdown)
- Patient Search: (text input)

**Quick Filters** (buttons):
- Today
- Tomorrow
- This Week
- Next Week
- All Upcoming
- All Past

**Sort Options**:
- Date & Time (default)
- Patient Name
- Status
- Doctor

**Appointment List Table**:
| Appt # | Date | Time | Patient | Type | Doctor | Status | Actions |
|--------|------|------|---------|------|--------|--------|---------|
| APT-.. | 15/03| 10:00| John Doe| F/U  | Smith  | ●Sched | View/Edit/Cancel |

**Bulk Actions** (select multiple):
- Mark as Confirmed
- Send Reminders
- Export to CSV
- Print Appointment List

**Pagination**: 25 appointments per page

---

### D. Appointment Detail & Management

#### Appointment Detail Modal

**Header**:
- Appointment Number
- Status badge
- Date & Time (large, prominent)

**Patient Information**:
- Name (click to go to patient detail)
- Patient ID
- Age, Gender
- Phone (click to call)
- Email

**Appointment Information**:
- Type
- Duration
- Assigned Doctor
- Reason for Visit
- Notes
- Created by (user)
- Created at (timestamp)

**Status History** (if status changed):
- Originally Scheduled: 10/03/26 by Receptionist
- Confirmed: 12/03/26 by Patient (phone)
- Completed: 15/03/26 by Doctor

**Actions**:
- Edit Appointment
- Reschedule
- Change Status
- Mark as No-show
- Cancel Appointment (with reason)
- Start Visit (creates visit record, links to appointment)
- Print Appointment Slip
- Send Reminder

---

#### Edit/Reschedule Appointment

**Edit Capabilities**:
- Change date/time (with conflict check)
- Change duration
- Change doctor (with confirmation)
- Update reason/notes
- Cannot change patient (create new instead)

**Reschedule Flow**:
1. Click "Reschedule"
2. Shows calendar with available slots highlighted
3. Select new date/time
4. Confirm and save
5. Optional: Notify patient of change

---

#### Appointment Status Management

**Status Workflow**:
```
Scheduled → Confirmed → In Progress → Completed
    ↓           ↓            ↓
Cancelled   No-show      Cancelled
```

**Status Change Actions**:
- **Mark as Confirmed**: Patient called and confirmed
- **Mark In Progress**: Patient arrived, consultation started
- **Mark Completed**: Visit finished
  - Prompts: "Create visit record?" (links appointment to visit)
- **Mark as No-show**: Patient didn't arrive
  - Prompts for reason/notes
- **Cancel Appointment**: 
  - Requires cancellation reason (dropdown + notes)
    - Patient requested
    - Doctor unavailable
    - Emergency
    - Other
  - Cannot un-cancel (can only create new)

**Automated Status Updates** (if desired):
- Auto-mark "In Progress" when visit created from appointment
- Auto-mark "Completed" when visit is saved

---

### E. Appointment Reminders (Placeholder for Future)

**Reminder Settings** (in Settings page):
- [ ] Enable automatic reminders
- Reminder timing: 
  - [ ] 1 day before
  - [ ] 2 hours before
- Reminder method:
  - [ ] SMS (requires integration)
  - [ ] Email (requires setup)
  - [ ] WhatsApp (requires integration)

**Manual Reminder**:
- Button: "Send Reminder Now"
- Shows: "Reminder functionality will be available in future update"
- Logs reminder attempt in appointment history

---

### F. Appointment Statistics & Reports

#### Dashboard Widget: Today's Appointments

**Display**:
- Total appointments today: 12
- Completed: 5
- Remaining: 7
- No-shows: 0

**List of Today's Appointments**:
- Next 5 upcoming (sorted by time)
- Quick status update buttons
- Click to view details

---

#### Appointment Analytics

**Reports Page → Appointments Tab**:

**Metrics**:
- Total appointments (date range)
- Completion rate (%)
- No-show rate (%)
- Average wait time (if tracked)
- Busiest days/times (heat map)

**Charts**:
- Appointments per day (line chart)
- Appointments by type (pie chart)
- Appointments by doctor (bar chart)
- No-show trends (line chart)

**Export Options**:
- Export report as PDF
- Export data as CSV
- Print report

---

### G. Waitlist Management (Optional Enhancement)

**Waitlist Feature**:
- Add patient to waitlist (when no appointments available)
- Waitlist entry fields:
  - Patient
  - Preferred dates (multiple)
  - Priority (Normal, Urgent)
  - Contact method
  - Notes

**Waitlist View**:
- List of all waitlist entries
- Sort by priority, date added
- Actions: Contact Patient, Schedule, Remove

**Auto-notification**:
- When appointment slot opens, notify waitlist patients
- "Call next" button to contact first in queue

---

## Technical Implementation

### Backend Routes

```javascript
// Appointment routes
GET    /api/appointments                    // All appointments (with filters)
POST   /api/appointments                    // Create appointment
GET    /api/appointments/:id                // Single appointment
PUT    /api/appointments/:id                // Update appointment
DELETE /api/appointments/:id                // Cancel appointment (soft delete)

// Calendar views
GET    /api/appointments/calendar/daily?date=...&doctor=...
GET    /api/appointments/calendar/weekly?weekStart=...
GET    /api/appointments/calendar/monthly?month=...&year=...

// Patient appointments
GET    /api/patients/:patientId/appointments

// Appointment availability
GET    /api/appointments/availability?date=...&doctor=...
POST   /api/appointments/check-conflicts    // Check for overlaps

// Status management
PUT    /api/appointments/:id/status
POST   /api/appointments/:id/reschedule

// Reminders (placeholder)
POST   /api/appointments/:id/send-reminder

// Statistics
GET    /api/appointments/stats?from=...&to=...

// Waitlist (optional)
GET    /api/waitlist
POST   /api/waitlist
DELETE /api/waitlist/:id
```

---

### Database Queries

**Appointment Number Generation**:
- Format: `APT-YYYYMMDD-####`
- Auto-increment per day

**Availability Query**:
```sql
-- Find available time slots for a doctor on a date
SELECT time_slot
FROM all_time_slots
WHERE time_slot NOT IN (
  SELECT appointment_time 
  FROM appointments 
  WHERE doctor_id = ? 
  AND appointment_date = ?
  AND status NOT IN ('Cancelled', 'No-show')
)
```

**Conflict Detection**:
```sql
-- Check if proposed appointment overlaps with existing
SELECT COUNT(*) 
FROM appointments 
WHERE doctor_id = ? 
AND appointment_date = ?
AND status NOT IN ('Cancelled', 'No-show')
AND (
  (appointment_time <= ? AND DATETIME(appointment_time, '+' || duration_minutes || ' minutes') > ?)
  OR
  (appointment_time < DATETIME(?, '+' || ? || ' minutes') AND appointment_time >= ?)
)
```

---

## UI Components

### Custom Components

1. **CalendarGrid**: 
   - Responsive time-slot grid
   - Drag & drop support
   - Color-coded appointments
   - Hover tooltips

2. **AppointmentCard**:
   - Compact display for calendar blocks
   - Status indicator
   - Patient info
   - Click actions

3. **TimeSlotPicker**:
   - Visual time slot selection
   - Shows available/booked slots
   - Conflict highlighting
   - Duration selector

4. **AppointmentSlip**:
   - Print-friendly appointment confirmation
   - Patient details
   - Date, time, doctor
   - Clinic address, phone
   - Map/directions (optional)

5. **StatusBadge**:
   - Color-coded status indicator
   - Tooltip with status details
   - Click to change status (if permitted)

---

## Calendar Interactions

### Drag & Drop Rescheduling

**Flow**:
1. User clicks and holds appointment block
2. Appointment becomes draggable
3. Valid drop targets (empty slots) highlight
4. Invalid slots (conflicts) show red
5. On drop:
   - Confirmation dialog with old→new time
   - Check conflicts
   - Update appointment
   - Refresh calendar

**Validation**:
- Cannot drop outside clinic hours
- Cannot drop in past
- Must have permission (admin/doctor)
- Conflict warning (can override)

---

## Print Layouts

### Appointment Slip

```
┌─────────────────────────────────────────┐
│  [Clinic Logo]    APPOINTMENT SLIP      │
│                                         │
│  Clinic Name                            │
│  Address, Phone, Email                  │
├─────────────────────────────────────────┤
│                                         │
│  Appointment Number: APT-20260315-0001  │
│                                         │
│  Patient Name:  John Doe                │
│  Patient ID:    PID-20250101-0123       │
│  Phone:         0300-1234567            │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Date:     Monday, March 15, 2026       │
│  Time:     10:30 AM                     │
│  Doctor:   Dr. Sarah Smith              │
│  Type:     Follow-up Visit              │
│                                         │
│  Duration: 30 minutes                   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Please arrive 10 minutes early.        │
│                                         │
│  If you need to reschedule, please      │
│  contact us at least 24 hours in        │
│  advance.                               │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Clinic Hours: 9:00 AM - 6:00 PM        │
│  Phone: +92-51-1234567                  │
└─────────────────────────────────────────┘
```

### Daily Appointment List (for reception/doctor)

```
APPOINTMENTS - Monday, March 15, 2026
Dr. Sarah Smith

┌────────┬─────────────────┬──────────────┬─────────┐
│ Time   │ Patient         │ Type         │ Status  │
├────────┼─────────────────┼──────────────┼─────────┤
│ 09:00  │ John Doe        │ Follow-up    │ ●Sched  │
│        │ PID-..., 0300-..│              │         │
├────────┼─────────────────┼──────────────┼─────────┤
│ 09:30  │ Jane Smith      │ New Patient  │ ●Confir │
│        │ PID-..., 0301-..│              │         │
├────────┼─────────────────┼──────────────┼─────────┤
│ ...    │                 │              │         │
└────────┴─────────────────┴──────────────┴─────────┘

Total: 12 appointments
```

---

## Testing Checklist

- [ ] Can create new appointment with all fields
- [ ] Appointment number generates correctly
- [ ] Can search and select patient for appointment
- [ ] Date/time validation works (no past dates, within hours)
- [ ] Conflict detection works for overlapping appointments
- [ ] Daily calendar view displays appointments correctly
- [ ] Weekly calendar view shows full week
- [ ] Monthly calendar view shows appointment counts
- [ ] Can click calendar slot to schedule appointment
- [ ] Can drag & drop appointments to reschedule
- [ ] Appointment list view filters work (date, status, doctor)
- [ ] Can edit appointment details
- [ ] Can change appointment status (confirm, complete, no-show)
- [ ] Can cancel appointment with reason
- [ ] Cancelled appointments don't show in available slots
- [ ] Can start visit from appointment (creates visit record)
- [ ] Appointment slip prints correctly
- [ ] Dashboard shows today's appointments
- [ ] Appointment statistics calculate correctly
- [ ] Can export appointments to CSV
- [ ] Role-based access controls appointment functions
- [ ] Multiple doctors show separately in calendar
- [ ] Appointment colors display by status

---

## Performance Considerations

- **Calendar Rendering**: 
  - Load only visible date range
  - Lazy load month/week data
  - Cache frequently accessed views
  
- **Search Optimization**:
  - Index on appointment_date, doctor_id, status
  - Patient autocomplete with debounce
  
- **Real-time Updates**:
  - Refresh calendar when appointment created/updated
  - WebSocket for multi-user calendar sync (future)

---

## Role-Based Access

**Admin & Doctor**:
- Full access to all appointments
- Can create, edit, cancel, reschedule
- Can view all doctors' calendars

**Receptionist**:
- Can create and manage appointments
- Can view all calendars
- Can change status (confirm, no-show)
- Cannot delete appointments (only cancel)

**Accountant**:
- View-only access to appointments
- Can see appointment-billing links
- No creation/editing rights

---

## Success Criteria

Phase 4 is complete when:
- ✅ Can schedule appointments with conflict checking
- ✅ Daily calendar view works with time slots
- ✅ Weekly calendar view shows full week
- ✅ Monthly calendar view shows appointment counts
- ✅ Can reschedule appointments via drag & drop
- ✅ Appointment list filters and sorts correctly
- ✅ Can change appointment status (confirm, complete, cancel, no-show)
- ✅ Can link appointment to visit record
- ✅ Appointment slips print correctly
- ✅ Dashboard shows today's appointments
- ✅ Appointment statistics and reports work
- ✅ Role-based access properly enforced
- ✅ Multi-doctor support works if multiple doctors configured

**Ready to proceed to Phase 5: Eye-Specific Features & Custom Fields**
