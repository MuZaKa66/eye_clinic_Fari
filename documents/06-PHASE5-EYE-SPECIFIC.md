# Phase 5: Eye-Specific Features & Custom Expandable Fields

## Objective
Enhance the system with advanced eye-specific tracking, prescription history comparison, and flexible custom fields for research and future needs.

---

## Features to Implement

### A. Spectacle Prescription History & Tracking

#### Prescription History Timeline

**Patient Detail → Spectacles Tab (New)**:

**Visual Timeline**:
- Chronological display of all spectacle prescriptions
- Shows progression over time
- Visual indicators for significant changes

**Timeline Display**:
```
2026 ────●─────────●──────●────→
         │         │      │
      Mar 15   Feb 10  Jan 5
       -2.50    -2.25   -2.00  (OD Sphere)
```

**Prescription Comparison View**:
Side-by-side comparison of prescriptions

| Date | OD SPH | OD CYL | OD AXIS | OS SPH | OS CYL | OS AXIS | Change |
|------|--------|--------|---------|--------|--------|---------|--------|
| Mar 15, 26 | -2.50 | -1.00 | 90 | -3.00 | -0.75 | 85 | ↗️ Increased |
| Feb 10, 26 | -2.25 | -1.00 | 90 | -2.75 | -0.75 | 85 | ↗️ Increased |
| Jan 5, 26  | -2.00 | -0.75 | 95 | -2.50 | -0.50 | 90 | - Initial |

**Change Indicators**:
- ↗️ Increased (red, concerning)
- ↘️ Decreased (green, improving)
- → Stable (blue, no change)
- ⚠️ Significant change (>0.50 change, yellow highlight)

**Charts**:
- Line graph: Sphere progression over time (OD and OS)
- Line graph: Cylinder progression
- Scatter plot: Rate of change

---

### B. IOP (Intraocular Pressure) Tracking

#### IOP History Chart

**Patient Detail → IOP Tracking Tab (New)**:

**IOP Chart**:
- Dual line graph (OD and OS)
- X-axis: Date
- Y-axis: IOP (mmHg)
- Reference lines:
  - Normal range: 10-21 mmHg (green zone)
  - Borderline: 21-24 mmHg (yellow zone)
  - High: >24 mmHg (red zone)

**IOP Table**:
| Date | Time | OD (mmHg) | OS (mmHg) | Method | Notes |
|------|------|-----------|-----------|--------|-------|
| Mar 15 | 10:30 | 18 | 17 | Goldman | Normal |
| Feb 10 | 11:00 | 22 | 21 | Goldman | Borderline ⚠️ |
| Jan 5  | 09:15 | 20 | 19 | Goldman | Normal |

**Alerts**:
- High IOP warning (>21) with red badge
- Trend alert: "IOP increasing over last 3 visits"
- Recommendation: "Consider glaucoma screening"

**Export Options**:
- Export IOP data to CSV (for research)
- Print IOP chart
- Share with patient (PDF)

---

### C. Visual Acuity Tracking

#### Vision Progression Chart

**Patient Detail → Vision History Tab (New)**:

**Visual Acuity Chart**:
- Line graph showing vision over time
- Separate lines for OD and OS
- Distance and Near vision (toggle)
- Y-axis: Vision (6/6, 6/9, 6/12, etc.)
- X-axis: Date

**Conversion Logic**:
```
6/6  = 1.0  (100%)
6/9  = 0.67 (67%)
6/12 = 0.5  (50%)
6/18 = 0.33 (33%)
...
```

**Vision Table**:
| Date | OD Distance | OS Distance | OD Near | OS Near | Change |
|------|-------------|-------------|---------|---------|--------|
| Mar 15 | 6/6 | 6/9 | N6 | N8 | Stable |
| Feb 10 | 6/6 | 6/9 | N6 | N8 | Improved |
| Jan 5  | 6/9 | 6/12 | N8 | N10 | - |

**Alerts**:
- Vision deterioration: "OS vision decreased from 6/6 to 6/9"
- Significant change: Vision change >2 lines

---

### D. Custom Fields System (For Research & Flexibility)

#### Custom Field Manager (Admin Only)

**Settings → Custom Fields**:

**Field Definition Form**:

**Create New Custom Field**:
- Field Name: (text, required)
  - Example: "Family History of Glaucoma"
  - Example: "Smoking Status"
  - Example: "Daily Screen Time (hours)"
  
- Apply To: (dropdown, required)
  - Patient Record
  - Visit/Consultation
  - Eye Examination
  
- Data Type: (dropdown, required)
  - Text (single line)
  - Text Area (multi-line)
  - Number
  - Date
  - Boolean (Yes/No checkbox)
  - Dropdown (predefined options)
  - Multi-select (checkboxes)
  
- Options (if dropdown/multi-select):
  - Add option rows
  - Example for "Smoking Status": Never, Former, Current
  
- Required: (checkbox)
- Show in Reports: (checkbox)
- Research Field: (checkbox) - Marks field for data export
- Help Text: (text area) - Tooltip for users
- Sort Order: (number) - Display order

**Custom Fields List**:
| Field Name | Type | Applied To | Required | Research | Actions |
|------------|------|------------|----------|----------|---------|
| Family Hx Glaucoma | Boolean | Patient | No | Yes | Edit/Delete |
| Smoking Status | Dropdown | Patient | No | Yes | Edit/Delete |
| Screen Time | Number | Visit | No | Yes | Edit/Delete |

---

#### Custom Fields in Forms

**Patient Registration Form** (if custom fields added):
- New section: "Additional Information"
- Displays all custom fields for "Patient Record"
- Renders appropriate input based on data type

**Visit Form** (if custom fields added):
- New section: "Custom Data Points"
- Displays all custom fields for "Visit/Consultation"

**Eye Examination Form** (if custom fields added):
- Section: "Additional Measurements"
- Displays all custom fields for "Eye Examination"

**Example Rendering**:
```
┌─ Additional Information ──────────────────┐
│                                           │
│ Family History of Glaucoma                │
│ [ ] Yes  [ ] No                           │
│                                           │
│ Smoking Status                            │
│ [Dropdown: Never ▼]                       │
│                                           │
│ Daily Screen Time (hours)                 │
│ [_____] hours                             │
│                                           │
└───────────────────────────────────────────┘
```

---

#### Custom Fields in Reports & Export

**Data Export Enhancement**:

**Export Wizard**:
1. Select entity type: Patients / Visits / Examinations
2. Select standard fields (checkboxes)
3. **Select custom fields** (checkboxes with "Research Field" badge)
4. Choose format: CSV / Excel
5. Date range filter
6. Export

**CSV Output Example**:
```csv
Patient_ID,Name,Age,Gender,OD_Sphere,OS_Sphere,IOP_OD,IOP_OS,Family_Hx_Glaucoma,Smoking_Status,Screen_Time
PID-001,John Doe,45,M,-2.50,-3.00,18,17,Yes,Former,8
PID-002,Jane Smith,52,F,-1.75,-2.00,22,21,No,Never,4
...
```

---

### E. Condition-Specific Tracking Modules

#### Glaucoma Management Module

**If patient has glaucoma diagnosis**:

**Glaucoma Dashboard** (Patient Detail → Glaucoma Tab):

**Key Metrics**:
- Latest IOP: OD 18, OS 17 (Good control)
- IOP Trend: Stable over 6 months
- Visual Field: Last test 2 months ago
- OCT RNFL: Last test 3 months ago
- Medication Compliance: Good

**Glaucoma History**:
- Date of diagnosis
- Baseline IOP
- Target IOP: OD <18, OS <18
- Current medications
- Surgical history (if any)

**Alerts**:
- ⚠️ IOP above target
- ⚠️ Visual field test due (recommended every 6 months)
- ⚠️ OCT RNFL overdue

**Quick Actions**:
- Order visual field test
- Order OCT
- Adjust medications
- Schedule follow-up

---

#### Diabetic Retinopathy Screening Module

**If patient has diabetes**:

**DR Screening Tab** (Patient Detail):

**Screening Status**:
- Last screening: 6 months ago
- Result: No DR detected
- Next due: In 6 months

**Screening Schedule**:
- No DR: Annual screening
- Mild NPDR: 6-month screening
- Moderate NPDR: 3-month screening
- Severe NPDR: Monthly monitoring

**HbA1c Tracking**:
- Latest: 7.2% (3 months ago)
- Trend: Improving
- Chart: HbA1c over time

**Alerts**:
- 🔴 Screening overdue
- ⚠️ HbA1c elevated (>7%)
- ✅ Well controlled

---

#### Cataract Progression Tracking

**If patient has cataract**:

**Cataract Assessment Tab**:

**Grading History**:
| Date | OD Grade | OS Grade | Visual Impact | Surgery Planned |
|------|----------|----------|---------------|-----------------|
| Mar 15 | NS 2+ | NS 3+ | Moderate | Considering |
| Dec 10 | NS 1+ | NS 2+ | Mild | No |

**Grading System** (dropdown in examination):
- Nuclear Sclerosis: 0, 1+, 2+, 3+, 4+
- Cortical: 0, 1+, 2+, 3+, 4+
- PSC: 0, 1+, 2+, 3+, 4+

**Surgery Tracking**:
- Pre-op vision
- Surgery date
- IOL details (power, type)
- Post-op vision
- Complications (if any)

---

### F. Research Data Export & Analytics

#### Research Export Tool

**Reports → Research Data Export**:

**Export Configuration**:

**Step 1: Select Data Scope**:
- [ ] Patient Demographics
- [ ] Visit Data
- [ ] Eye Examinations
- [ ] Prescriptions
- [ ] Test Reports (metadata, not images)
- [ ] IOP Readings
- [ ] Custom Fields (select specific)

**Step 2: Apply Filters**:
- Date Range: From [____] To [____]
- Age Range: From [__] To [__]
- Gender: [All / Male / Female / Other]
- Diagnosis: (multi-select)
- Custom Field Filters: (dynamic based on custom fields)

**Step 3: De-identification** (Privacy):
- [ ] Remove patient names
- [ ] Remove contact information
- [ ] Replace Patient ID with anonymous ID
- [ ] Remove dates (keep age at visit only)

**Step 4: Export Format**:
- CSV (for statistical software)
- Excel (for manual analysis)
- JSON (for API integration)
- SPSS format (for SPSS users)

**Export Button**: Generate & Download

---

#### Statistical Reports

**Built-in Analytics**:

**Patient Demographics Report**:
- Age distribution (histogram)
- Gender breakdown (pie chart)
- Common diagnoses (bar chart)
- Geographic distribution (if postal codes tracked)

**Clinical Metrics Report**:
- Average IOP by age group
- Prescription distribution (myopia/hyperopia percentages)
- Vision improvement rates
- Diagnosis frequency

**Operational Reports**:
- Patients registered per month
- Visits per month
- Average visits per patient
- Appointment completion rates

---

## Technical Implementation

### Backend Routes

```javascript
// Prescription history
GET    /api/patients/:patientId/prescription-history
GET    /api/patients/:patientId/prescription-comparison

// IOP tracking
GET    /api/patients/:patientId/iop-history
GET    /api/patients/:patientId/iop-chart

// Vision tracking
GET    /api/patients/:patientId/vision-history

// Custom fields management (admin only)
GET    /api/custom-fields
POST   /api/custom-fields
PUT    /api/custom-fields/:id
DELETE /api/custom-fields/:id
GET    /api/custom-fields/entity/:entityType  // Get fields for specific entity

// Custom field values
GET    /api/custom-field-values/:entityType/:entityId
POST   /api/custom-field-values
PUT    /api/custom-field-values/:id

// Research export
POST   /api/research/export
GET    /api/research/reports/demographics
GET    /api/research/reports/clinical

// Condition modules
GET    /api/patients/:patientId/glaucoma-dashboard
GET    /api/patients/:patientId/diabetes-screening
GET    /api/patients/:patientId/cataract-tracking
```

---

### Database Implementation

**Custom Fields Storage**:

**custom_fields** table: Stores field definitions
**custom_field_values** table: Stores actual values

**Querying Custom Fields**:
```javascript
// Get all data for a patient including custom fields
SELECT p.*, 
       GROUP_CONCAT(cf.field_name || ':' || cfv.field_value) as custom_data
FROM patients p
LEFT JOIN custom_field_values cfv ON cfv.entity_id = p.id AND cfv.entity_type = 'patient'
LEFT JOIN custom_fields cf ON cf.id = cfv.field_id
GROUP BY p.id
```

**Flexible Schema Benefits**:
- Can add fields without database migration
- Research fields can be added on demand
- No code changes needed for new fields
- Export includes custom fields automatically

---

### Chart Libraries

Use **Chart.js** or **Recharts** for visualizations:
- Line charts: IOP, vision, prescription trends
- Bar charts: Diagnosis frequency, demographics
- Pie charts: Gender, diagnosis distribution
- Scatter plots: Correlation analysis (age vs IOP, etc.)

---

## UI Components

### Custom Components

1. **PrescriptionTimeline**:
   - Visual timeline with prescription cards
   - Zoom in/out
   - Filter by date range

2. **IOPChart**:
   - Dual-line chart (OD/OS)
   - Reference zones (normal/borderline/high)
   - Hover tooltips with details
   - Print functionality

3. **CustomFieldBuilder**:
   - Drag & drop field creator
   - Preview pane
   - Field type selector
   - Options editor

4. **DataExportWizard**:
   - Step-by-step configuration
   - Field selector with preview
   - Export progress indicator
   - Download button

5. **ConditionModule**:
   - Reusable template for condition tracking
   - Metrics display
   - Alert system
   - Quick actions

---

## Testing Checklist

- [ ] Prescription history timeline displays correctly
- [ ] Prescription comparison shows changes
- [ ] Change indicators (↗️↘️→) work correctly
- [ ] IOP chart displays with reference zones
- [ ] IOP alerts trigger for high readings
- [ ] Vision tracking chart shows progression
- [ ] Can create custom fields for all entity types
- [ ] Custom fields render in appropriate forms
- [ ] Custom field values save and retrieve correctly
- [ ] Can edit and delete custom fields (if not in use)
- [ ] Glaucoma module displays for glaucoma patients
- [ ] DR screening module shows for diabetic patients
- [ ] Cataract tracking records progression
- [ ] Research export wizard works
- [ ] Export includes selected custom fields
- [ ] De-identification option works
- [ ] Statistical reports calculate correctly
- [ ] All charts render and are interactive
- [ ] Print functionality works for charts
- [ ] Role-based access controls custom field management

---

## Performance Considerations

- **Chart Data**: 
  - Load only visible date range
  - Lazy load historical data
  - Cache calculated trends
  
- **Custom Fields**:
  - Index on entity_type and entity_id
  - Cache field definitions
  - Batch load custom values with entities
  
- **Export**:
  - Stream large exports (don't load all in memory)
  - Show progress for long-running exports
  - Limit export size (warn if >10,000 records)

---

## Success Criteria

Phase 5 is complete when:
- ✅ Prescription history shows timeline and comparison
- ✅ IOP tracking chart displays with alerts
- ✅ Vision progression chart works
- ✅ Can create and manage custom fields
- ✅ Custom fields appear in appropriate forms
- ✅ Custom field values save and display correctly
- ✅ Condition modules (glaucoma, DR, cataract) work
- ✅ Research export wizard generates correct data
- ✅ De-identification option works for privacy
- ✅ Statistical reports calculate and display correctly
- ✅ All charts are interactive and printable
- ✅ Role-based access controls all features properly

**Ready to proceed to Phase 6: Advanced Features (Search, Billing, User Roles)**
