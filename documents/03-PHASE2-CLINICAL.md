# Phase 2: Clinical Data Entry & Patient Visits

## Objective
Implement comprehensive visit recording, diagnosis entry, and patient clinical history tracking.

---

## Features to Implement

### A. New Visit/Consultation Entry

#### Visit Creation Flow
From Patient Detail Page → Click "New Visit" → Opens Visit Form

#### Visit Form - Section 1: Visit Information

**Visit Header** (auto-populated):
- Visit Number: `VIS-YYYYMMDD-0001` (auto-generated)
- Patient Name: (from patient record)
- Patient ID: (from patient record)
- Visit Date: (default today, editable)
- Visit Time: (default current time, editable)

**Visit Details**:
- Visit Type (dropdown, required):
  - New Consultation
  - Follow-up
  - Emergency
  - Routine Check-up
  - Post-operative
- Chief Complaint (text area, required):
  - Patient's main complaint in their words
  - Prompt: "What brings you here today?"

---

#### Visit Form - Section 2: Eye Examination Data

**Visual Acuity** (separate for each eye):

**Right Eye (OD - Oculus Dexter)**:
- Distance Vision (dropdown): 6/6, 6/9, 6/12, 6/18, 6/24, 6/36, 6/60, CF, HM, PL, NPL
- Near Vision (dropdown): N6, N8, N10, N12, N18, N24, N36

**Left Eye (OS - Oculus Sinister)**:
- Distance Vision (dropdown)
- Near Vision (dropdown)

**Refraction** (if applicable):

**Right Eye (OD)**:
- Sphere: (number input, -20.00 to +20.00, step 0.25)
- Cylinder: (number input, -10.00 to +10.00, step 0.25)
- Axis: (number input, 0 to 180)
- Add: (number input, +0.50 to +4.00, step 0.25) - for reading

**Left Eye (OS)**:
- Sphere, Cylinder, Axis, Add (same format)

**Intraocular Pressure (IOP)**:
- Right Eye (OD): (number input, mmHg, 5-50 range)
- Left Eye (OS): (number input, mmHg, 5-50 range)
- Method (dropdown): Goldman, Non-contact, Tonopen

**Pupil Examination**:
- Right Eye (OD): (text input)
  - Example: "PERRLA" (Pupils Equal, Round, Reactive to Light and Accommodation)
- Left Eye (OS): (text input)

**Color Vision**:
- Result (dropdown): Normal, Defective
- Test Used (dropdown): Ishihara, Farnsworth, Hardy-Rand-Rittler
- Notes: (text input)

**Additional Examination Notes**: (text area)
- Slit lamp findings
- Fundus examination
- Other observations

---

#### Visit Form - Section 3: Diagnosis

**Diagnosis** (required):
- Primary Diagnosis (text area, required)
  - Common diagnoses dropdown for quick selection:
    - Myopia
    - Hyperopia
    - Astigmatism
    - Presbyopia
    - Cataract
    - Glaucoma
    - Diabetic Retinopathy
    - Dry Eye Syndrome
    - Conjunctivitis
    - Corneal Ulcer
    - Age-related Macular Degeneration
    - Custom (allows free text)

**ICD-10 Code** (optional): (text input with autocomplete)

**Secondary Diagnosis** (optional): (text area)

---

#### Visit Form - Section 4: Doctor's Notes

**Clinical Notes** (text area, optional):
- Private notes for doctor
- Observations
- Follow-up instructions

**Patient Instructions** (text area):
- Instructions given to patient
- Lifestyle modifications
- When to return

---

#### Save Options
- **Save Visit**: Saves and stays on form
- **Save & Print**: Saves and opens print preview
- **Save & Prescribe**: Saves and opens prescription form
- **Save & Order Tests**: Saves and opens test recommendation form
- **Cancel**: Returns to patient detail page

---

### B. Visit History View

#### Patient Detail Page - Visits Tab

**Visit List** (chronological, newest first):
- Visit Number
- Visit Date
- Visit Type
- Chief Complaint (truncated)
- Diagnosis (truncated)
- Doctor Name
- Actions: View, Edit, Print

**Visit Detail Modal/Page**:
When clicking "View" on a visit:

**Header Section**:
- Visit Number, Date, Time
- Patient Name, Age, Gender
- Visit Type
- Doctor Name

**Content Sections** (tabbed or accordion):
1. **Chief Complaint & Diagnosis**
2. **Eye Examination Data**:
   - Visual Acuity table
   - Refraction table
   - IOP readings
   - Pupil & Color Vision
   - Examination notes
3. **Clinical Notes**
4. **Prescriptions** (linked from Phase 3)
5. **Tests Recommended** (linked from Phase 3)

**Actions**:
- Edit Visit
- Print Summary
- Add Prescription
- Recommend Tests
- Schedule Follow-up

---

### C. Patient Clinical Timeline

#### Patient Detail Page - Overview Tab Enhancement

**Timeline View**:
Visual chronological timeline showing:
- Registration date
- All visits (with diagnosis summary)
- Prescriptions issued
- Tests ordered
- Test results uploaded
- Appointments
- Billing records

**Interactive Timeline**:
- Click any event to expand details
- Filter by event type
- Search within timeline
- Export timeline as PDF

---

### D. Quick Visit Entry (for busy doctors)

**Express Mode Toggle**: Simplified single-screen form
- Essential fields only:
  - Chief Complaint
  - Quick refraction (OD/OS sphere only)
  - IOP
  - Diagnosis
  - Quick prescription checkbox
- Skips detailed examination fields
- Can be expanded to full mode if needed

---

## Technical Implementation

### Backend Routes

```javascript
// Visit routes
GET    /api/visits                    // All visits (with filters)
POST   /api/visits                    // Create new visit
GET    /api/visits/:id                // Single visit details
PUT    /api/visits/:id                // Update visit
DELETE /api/visits/:id                // Delete visit (admin only)
GET    /api/patients/:patientId/visits // All visits for a patient

// Eye examination routes
GET    /api/eye-examinations/visit/:visitId
POST   /api/eye-examinations
PUT    /api/eye-examinations/:id

// Diagnosis codes (for autocomplete)
GET    /api/diagnosis-codes?search=...  // ICD-10 lookup
```

### Database Considerations

**Visit Number Generation**:
- Format: `VIS-YYYYMMDD-####`
- Auto-increment per day
- Function: `generateVisitNumber()`

**Data Validation**:
- Vision values from predefined lists
- Refraction values within medical ranges
- IOP normal range alert (>21 mmHg)
- Required fields enforced

**Relationships**:
- One visit → One eye examination (1:1)
- One visit → Multiple prescriptions (1:N) - Phase 3
- One visit → Multiple test recommendations (1:N) - Phase 3

---

## UI Components

### Reusable Components to Create

1. **RefractorInput**: Combined sphere/cylinder/axis input
   ```
   [  -2.50  ] / [  -1.00  ] × [  90  ]
    Sphere      Cylinder      Axis
   ```

2. **VisionSelector**: Dropdown with common vision values
   - Keyboard shortcuts for quick entry
   - Color coding (normal=green, abnormal=red)

3. **EyeDataCard**: Display OD/OS data side by side
   ```
   ┌─────────────┬─────────────┐
   │ Right Eye   │ Left Eye    │
   │ (OD)        │ (OS)        │
   ├─────────────┼─────────────┤
   │ 6/6         │ 6/9         │
   │ -2.50 DS    │ -3.00 DS    │
   │ IOP: 15     │ IOP: 16     │
   └─────────────┴─────────────┘
   ```

4. **VisitCard**: Summary card for visit list
5. **TimelineEvent**: Event item for clinical timeline

---

## Form Behavior

### Smart Defaults
- Visit Date: Today
- Visit Time: Current time
- Visit Type: New Consultation (for new patients), Follow-up (for returning)
- Doctor: Current logged-in user

### Auto-save
- Save draft every 30 seconds
- Restore draft on form reload
- Clear draft after successful save

### Keyboard Shortcuts
- `Ctrl+S`: Save
- `Ctrl+P`: Save & Print
- `Tab`: Navigate between eye data fields (OD→OS)
- `Ctrl+Enter`: Save & Prescribe

### Validation Alerts
- IOP > 21 mmHg: Yellow highlight with "High IOP" note
- Vision worse than 6/60: Alert for potential low vision
- Missing required fields: Red outline with error message

---

## Print Layout

### Visit Summary Print Format

**Header**:
- Clinic name and logo
- Doctor name and credentials
- Clinic address, phone

**Patient Info**:
- Name, Age, Gender
- Patient ID
- Visit Date & Number

**Content**:
- Chief Complaint
- Examination Findings (formatted tables)
- Diagnosis
- Instructions

**Footer**:
- Doctor signature (optional image upload in settings)
- Print date/time

---

## Role-Based Access

**Doctor & Admin**:
- Full access to all visit functions
- Can create, edit, delete visits
- Can view all patients' visits

**Receptionist**:
- Can view visits (read-only)
- Cannot create or edit clinical data
- Can print visit summaries

**Accountant**:
- Can view visits for billing purposes
- Read-only access
- No clinical data editing

---

## Testing Checklist

- [ ] Can create new visit with all fields
- [ ] Visit number generates correctly and increments
- [ ] Eye examination data saves properly
- [ ] Refraction values validate correctly
- [ ] IOP values show alerts for abnormal readings
- [ ] Diagnosis dropdown works and allows custom entry
- [ ] Can save visit and continue editing
- [ ] Can save and proceed to prescription
- [ ] Visit appears in patient's visit history
- [ ] Visit detail view displays all data correctly
- [ ] Can edit existing visit
- [ ] Timeline shows visits chronologically
- [ ] Print preview formats correctly
- [ ] Quick entry mode works for fast consultations
- [ ] Auto-save/draft recovery works
- [ ] All validations work on frontend and backend
- [ ] Role-based access enforced

---

## Data Export for Research

Add export functionality:
- Export all visits to CSV
- Include all examination data
- Anonymize patient data option
- Date range filter
- Diagnosis filter
- Fields selector (choose which columns to export)

**Export Format**:
```csv
Visit_Date,Patient_ID,Age,Gender,Visit_Type,Chief_Complaint,OD_Sphere,OD_Cylinder,OD_Axis,OS_Sphere,OS_Cylinder,OS_Axis,OD_IOP,OS_IOP,Diagnosis,Secondary_Diagnosis
```

---

## Performance Considerations

- Lazy load visit history (paginate after 10 visits)
- Index database on visit_date and patient_id
- Cache recent visits for quick access
- Optimize eye examination queries (join tables efficiently)

---

## Success Criteria

Phase 2 is complete when:
- ✅ Can record complete patient visits with all clinical data
- ✅ Eye examination data captures all required measurements
- ✅ Visit history displays chronologically
- ✅ Clinical timeline shows patient's health journey
- ✅ Can edit and update visit records
- ✅ Print functionality works for visit summaries
- ✅ Quick entry mode works for fast consultations
- ✅ Data validation prevents incorrect entries
- ✅ Auto-save prevents data loss
- ✅ Export to CSV works for research purposes
- ✅ Role-based access properly enforced

**Ready to proceed to Phase 3: Image Management**
