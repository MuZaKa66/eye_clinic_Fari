# Phase 3: Image Management - Prescriptions & Test Reports

## Objective
Implement comprehensive image upload, storage, and viewing for handwritten prescriptions and test report images.

---

## Features to Implement

### A. Prescription Management System

#### Prescription Form (Extended from Visit)

Access from:
1. During visit creation: "Save & Prescribe" button
2. From visit detail: "Add Prescription" button
3. From patient detail: "New Prescription" quick action

**Prescription Form Structure**:

**Header Section**:
- Prescription Number: `RX-YYYYMMDD-0001` (auto-generated)
- Patient Name, ID, Age
- Visit Number (linked)
- Date: (default today)
- Doctor Name

**Prescription Type Selection**:
- [ ] Medication Prescription
- [ ] Spectacle Prescription
- [ ] Both

---

#### Medication Prescription Entry

**Option 1: Keyboard Entry** (structured data)

**Medication Table** (add multiple rows):
| Medicine Name | Dosage | Frequency | Duration | Instructions |
|--------------|--------|-----------|----------|--------------|
| (text input) | (text) | (dropdown)| (text)   | (text)      |

**Frequency Dropdown Options**:
- Once daily
- Twice daily
- Three times daily
- Four times daily
- Every 6 hours
- Every 8 hours
- As needed (PRN)
- Custom

**Add Medicine Button**: Adds new row
**Common Medicines Dropdown**: Quick add frequently prescribed medicines

**Common Eye Medications List**:
- Artificial Tears
- Antibiotic Eye Drops (Moxifloxacin, Tobramycin)
- Steroid Eye Drops (Prednisolone, Dexamethasone)
- Anti-glaucoma (Timolol, Latanoprost, Dorzolamide)
- Anti-allergy (Olopatadine, Ketotifen)
- Mydriatic (Tropicamide, Cyclopentolate)

**General Instructions** (text area):
- Additional notes for patient
- Warnings (e.g., "Do not drive after using")

---

**Option 2: Upload Handwritten Prescription Image**

**Image Upload Section**:
- Drag & drop area
- Or click to browse
- Supported formats: JPG, PNG, PDF
- Max size: 5MB per file
- Multiple files allowed (front/back of prescription)

**Image Preview**:
- Thumbnail gallery
- Click to enlarge
- Rotate/crop tools
- Delete image option

**OCR Preview** (future enhancement placeholder):
- Button: "Extract Text (OCR)" - disabled for now
- Message: "OCR will be available in future update"

---

#### Spectacle Prescription Entry

**Auto-populate from Latest Eye Examination**:
- Button: "Copy from Latest Exam"
- Pulls refraction data from most recent visit

**Manual Entry**:

**Right Eye (OD)**:
- Sphere: (number, -20.00 to +20.00)
- Cylinder: (number, -10.00 to +10.00)
- Axis: (number, 0-180)
- Add (Reading): (number, +0.50 to +4.00)

**Left Eye (OS)**:
- Same fields

**Lens Type** (checkboxes):
- [ ] Single Vision
- [ ] Bifocal
- [ ] Progressive/Multifocal
- [ ] Photochromic
- [ ] Anti-reflective coating
- [ ] Blue light filter

**Additional Notes**: (text area)
- Pupillary distance (PD)
- Frame recommendations
- Other specifications

---

#### Save & Print Prescription

**Save Options**:
- **Save Prescription**: Saves data
- **Save & Print**: Opens print-ready prescription
- **Save & Email**: (future) Email to patient
- **Cancel**: Discard changes

**Print Layout - Prescription Pad**:

```
┌─────────────────────────────────────────────────────────┐
│  [Clinic Logo]          PRESCRIPTION                     │
│  Clinic Name                                             │
│  Address, Phone, Email                                   │
├─────────────────────────────────────────────────────────┤
│  Dr. [Doctor Name]                                       │
│  [Qualifications/Registration]                           │
├─────────────────────────────────────────────────────────┤
│  Patient: [Name]          Age: [Age]    Gender: [M/F]    │
│  Date: [DD/MM/YYYY]       Rx No: [RX-YYYYMMDD-0001]     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ℞  [Prescription Symbol]                                │
│                                                          │
│  [If Medications:]                                       │
│  1. [Medicine Name] - [Dosage]                          │
│     [Frequency] - [Duration]                            │
│     [Instructions]                                       │
│                                                          │
│  2. [Medicine Name] - [Dosage]                          │
│     ...                                                  │
│                                                          │
│  [If Spectacles:]                                        │
│                    SPH     CYL    AXIS    ADD           │
│  Right Eye (OD):  [-2.50] [-1.00] [90°]  [+2.00]       │
│  Left Eye (OS):   [-3.00] [-0.75] [85°]  [+2.00]       │
│                                                          │
│  Lens Type: [Progressive, Anti-reflective]              │
│                                                          │
│  Instructions: [Patient instructions text]              │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ___________________                                     │
│  Doctor's Signature                                      │
│                                                          │
│  Next Visit: [Date if specified]                        │
└─────────────────────────────────────────────────────────┘
```

---

### B. Test Recommendations & Reports

#### Test Recommendation Form

Access from:
1. During visit: "Save & Order Tests" button
2. From visit detail: "Recommend Tests" button

**Test Recommendation Form**:

**Test Selection** (add multiple):
- Test Name: (dropdown or text input)
- Test Type: (dropdown)
  - Laboratory (Blood, Urine)
  - Imaging (X-Ray, CT, MRI, Ultrasound)
  - OCT (Optical Coherence Tomography)
  - Visual Field Test
  - Fundus Photography
  - A-Scan/B-Scan
  - Pachymetry
  - Gonioscopy
  - Custom
- Priority: (dropdown)
  - Routine
  - Urgent
  - STAT
- Instructions: (text area)
- Expected Date: (date picker)

**Common Eye Tests** (quick select):
- OCT Macula
- OCT Optic Nerve
- Visual Field (Humphrey)
- Fundus Photo
- A-Scan (IOL calculation)
- B-Scan
- Pachymetry
- Blood Sugar (Fasting/Random)
- HbA1c
- Lipid Profile

**Add Test Button**: Adds new test row

**Save Options**:
- Save Tests
- Save & Print Test Request
- Cancel

---

#### Test Report Upload

**Access Points**:
1. From Test Recommendations list: "Upload Report" button
2. From patient detail → Tests tab
3. Bulk upload from visit detail

**Upload Interface**:

**Test Selection**:
- Dropdown: Select pending test recommendation
- Or: Upload independent report (create new entry)

**File Upload**:
- Drag & drop multiple files
- Supported: JPG, PNG, PDF, TIFF
- Max size: 10MB per file
- Multiple pages/images per test

**Report Metadata**:
- Test Date: (date picker)
- Uploaded By: (auto - current user)
- Report Summary: (text area - optional)
- Notes: (text area)

**Image Management**:
- Preview uploaded images
- Zoom in/out
- Rotate (90°, 180°, 270°)
- Multi-page PDF viewer
- Download original file
- Delete image (with confirmation)

**Save Options**:
- Upload & Mark Complete (changes test status to "Completed")
- Upload & Keep Pending
- Cancel

---

### C. Image Gallery & Viewer

#### Patient Images Gallery

**Patient Detail → Documents Tab**:

**Filter/Sort**:
- Filter by type: All, Prescriptions, Test Reports
- Sort by: Date (newest/oldest), Type
- Search by test name

**Gallery Grid View**:
```
┌──────────┬──────────┬──────────┬──────────┐
│ [Image]  │ [Image]  │ [Image]  │ [Image]  │
│ RX-001   │ OCT-001  │ RX-002   │ VF-001   │
│ 15/03/26 │ 16/03/26 │ 20/03/26 │ 22/03/26 │
└──────────┴──────────┴──────────┴──────────┘
```

**List View** (alternative):
| Preview | Type | Name | Date | Size | Actions |
|---------|------|------|------|------|---------|
| [thumb] | Rx   | ...  | ...  | ...  | View/Download/Delete |

---

#### Image Viewer (Lightbox)

**Features**:
- Full-screen modal
- Zoom controls (+/- buttons, mouse wheel)
- Pan (click & drag when zoomed)
- Rotate (toolbar buttons)
- Next/Previous navigation
- Download original
- Print image
- Close (X or ESC key)

**For Multi-page PDFs**:
- Page navigation controls
- Thumbnail strip
- Page counter (Page 1 of 5)

---

### D. Prescription History View

**Patient Detail → Prescriptions Tab**:

**Prescription List**:
| Rx Number | Date | Type | Doctor | Status | Actions |
|-----------|------|------|--------|--------|---------|
| RX-...    | ...  | Med  | Dr...  | Active | View/Print |
| RX-...    | ...  | Spec | Dr...  | Filled | View/Print |

**Status Options**:
- Active (current prescription)
- Filled (completed)
- Expired
- Cancelled

**Prescription Detail View**:
- Full prescription data
- Medication list or spectacle values
- Associated images
- Print button
- Refill button (creates new based on this one)
- Mark as Filled/Cancel

---

## Technical Implementation

### Backend Routes

```javascript
// Prescription routes
GET    /api/prescriptions
POST   /api/prescriptions
GET    /api/prescriptions/:id
PUT    /api/prescriptions/:id
DELETE /api/prescriptions/:id
GET    /api/patients/:patientId/prescriptions
GET    /api/visits/:visitId/prescriptions

// Upload prescription image
POST   /api/prescriptions/:id/upload-image
DELETE /api/prescriptions/:id/images/:imageId

// Test recommendation routes
GET    /api/test-recommendations
POST   /api/test-recommendations
GET    /api/test-recommendations/:id
PUT    /api/test-recommendations/:id
DELETE /api/test-recommendations/:id
GET    /api/patients/:patientId/test-recommendations
GET    /api/visits/:visitId/test-recommendations

// Test report upload
POST   /api/test-reports
GET    /api/test-reports/:testRecommendationId
DELETE /api/test-reports/:id
POST   /api/test-reports/:testRecommendationId/upload

// Image/File routes
GET    /api/files/:fileId  // Serve uploaded files
POST   /api/files/upload
DELETE /api/files/:fileId
```

### File Storage Structure

```
/uploads/
├── prescriptions/
│   ├── patient-123/
│   │   ├── rx-20260315-001.jpg
│   │   ├── rx-20260315-001_2.jpg  // Multiple images per Rx
│   │   └── rx-20260320-002.pdf
│   └── patient-456/
│       └── ...
└── reports/
    ├── patient-123/
    │   ├── oct-20260316-001.jpg
    │   ├── oct-20260316-001.pdf
    │   └── vf-20260322-001.pdf
    └── patient-456/
        └── ...
```

### File Upload Middleware (Multer)

**Configuration**:
```javascript
// Prescription uploads
storage: disk storage to /uploads/prescriptions/{patientId}/
filename: {rx-number}_{timestamp}.{ext}
fileFilter: images (jpg, jpeg, png) and PDF only
limits: 5MB per file

// Test report uploads
storage: disk storage to /uploads/reports/{patientId}/
filename: {test-type}_{timestamp}.{ext}
fileFilter: images (jpg, jpeg, png, tiff) and PDF
limits: 10MB per file
```

**Security**:
- Validate file types (magic numbers, not just extensions)
- Sanitize filenames
- Virus scanning (if possible)
- Rate limiting on uploads
- User authentication required

### Database Considerations

**Prescription Number Generation**:
- Format: `RX-YYYYMMDD-####`
- Auto-increment per day

**File Metadata Storage**:
Store in `prescriptions` table:
- `prescription_image_path`: JSON array of file paths
  Example: `["prescriptions/patient-123/rx-001.jpg", "prescriptions/patient-123/rx-001_2.jpg"]`

Store in `test_reports` table:
- Individual records per file
- Link to `test_recommendation_id`

**Soft Deletes**:
- Mark files as deleted but keep on disk
- Cleanup old files with scheduled task

---

## UI Components

### Custom Components

1. **ImageUploader**:
   - Drag & drop zone
   - File browser
   - Progress bars
   - Thumbnail previews
   - Delete/retry failed uploads

2. **ImageGallery**:
   - Grid/list view toggle
   - Filtering controls
   - Lazy loading
   - Click to enlarge

3. **ImageViewer/Lightbox**:
   - Full-screen modal
   - Zoom/pan controls
   - Navigation arrows
   - Download button

4. **PrescriptionPrintTemplate**:
   - Professional layout
   - Clinic header
   - Prescription content
   - Doctor signature
   - Print styles (@media print)

5. **RefractorDisplay**:
   - Read-only display of OD/OS values
   - Color-coded by prescription type

---

## Image Optimization

### On Upload:
- Resize large images (max 2000px width)
- Compress JPEG (85% quality)
- Create thumbnails (200px width)
- Generate preview images (800px width)

### On Display:
- Lazy load images
- Progressive loading
- Responsive images (srcset)
- Placeholder while loading

---

## Testing Checklist

- [ ] Can create prescription with medications
- [ ] Can create prescription with spectacle values
- [ ] Can create prescription with both medications and spectacles
- [ ] Prescription number generates correctly
- [ ] Can upload single prescription image
- [ ] Can upload multiple prescription images
- [ ] Image upload validates file type and size
- [ ] Prescription images display in gallery
- [ ] Can view prescription images in lightbox
- [ ] Can rotate images in viewer
- [ ] Can zoom and pan images
- [ ] Can delete prescription images
- [ ] Prescription prints correctly with all data
- [ ] Can recommend multiple tests at once
- [ ] Test recommendation saves and displays
- [ ] Can upload test report images
- [ ] Can upload multi-page PDF reports
- [ ] PDF viewer shows all pages correctly
- [ ] Can mark test as complete after upload
- [ ] Test reports link to correct recommendations
- [ ] Image gallery shows all patient documents
- [ ] Can filter documents by type
- [ ] Can download original files
- [ ] File storage structure is organized
- [ ] All uploaded files are accessible
- [ ] Role-based access controls file uploads

---

## Performance Considerations

- **Lazy Loading**: Load images only when in viewport
- **Thumbnails**: Generate and serve small versions for galleries
- **Caching**: Cache static image files with proper headers
- **CDN Ready**: File paths should work with CDN if needed later
- **Pagination**: Paginate image galleries (20 per page)
- **Progressive Enhancement**: Show low-res preview first

---

## Security Considerations

- **File Type Validation**: Check magic numbers, not just extensions
- **Size Limits**: Enforce on frontend and backend
- **Access Control**: Users can only access files for patients they can view
- **Secure URLs**: Use tokens or session-based access for file URLs
- **No Direct Paths**: Serve files through API, not direct filesystem access
- **Audit Trail**: Log all file uploads/downloads/deletions

---

## Success Criteria

Phase 3 is complete when:
- ✅ Can create prescriptions with medications and/or spectacles
- ✅ Can upload prescription images (single and multiple)
- ✅ Can recommend tests and track their status
- ✅ Can upload test report images and PDFs
- ✅ Image gallery displays all patient documents
- ✅ Image viewer works with zoom, rotate, navigation
- ✅ Prescriptions print professionally
- ✅ File storage is organized and secure
- ✅ All file uploads validate properly
- ✅ PDF reports display correctly (multi-page support)
- ✅ Role-based access controls all image operations
- ✅ Performance is good with many images

**Ready to proceed to Phase 4: Appointment Management**
