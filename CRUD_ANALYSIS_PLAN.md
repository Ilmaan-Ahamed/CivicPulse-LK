# CivicPulse LK - CRUD Operations & Database Interactions Analysis

## Executive Summary
This document maps all CRUD operations, database interactions, and role-based access patterns in the CivicPulse LK platform. It details how reports flow through the system and interact with different user roles.

---

## 1. Database Models Overview

### Core Entities
- **User** (4 roles: CITIZEN, NGO_PARTNER, DS_OFFICER, ADMIN)
- **Report** (central entity - infrastructure issues)
- **Photo** (evidence for reports/verifications/inspections)
- **Verification** (community verification of reports)
- **Assignment** (work assignments to agencies/NGOs)
- **FieldInspection** (field team inspections)
- **StatusHistory** (report status change tracking)
- **Agency** (government agencies, NGOs, field teams)
- **Notification** (user notifications)
- **AuditLog** (system audit trail)
- **RoleRequest** (role upgrade requests)

---

## 2. Existing CRUD Operations by Entity

### 2.1 User Management

#### `/api/auth/sync/route.ts` (POST)
- **Purpose**: Sync Clerk authentication users to database
- **Roles**: All authenticated users
- **Operations**: 
  - CREATE user if not exists
  - UPDATE user if exists by email
- **DB Tables**: `User`
- **Access**: Public (authenticated)

#### `/api/auth/register/route.ts` (POST)
- **Purpose**: User registration
- **Roles**: All
- **Operations**: CREATE user
- **DB Tables**: `User`
- **Access**: Public

#### `/api/auth/login/route.ts` (POST)
- **Purpose**: User login (mock + DB fallback)
- **Roles**: All
- **Operations**: READ user by email
- **DB Tables**: `User`
- **Access**: Public

#### `/api/users/route.ts` (GET)
- **Purpose**: List all users
- **Roles**: ADMIN only
- **Operations**: READ all users
- **DB Tables**: `User`
- **Access**: ADMIN

---

### 2.2 Report Management

#### `/api/reports/route.ts` (GET, POST)
- **GET Purpose**: List reports with optional status filter
- **POST Purpose**: Create new report
- **Roles**: 
  - GET: All authenticated
  - POST: CITIZEN, DS_OFFICER, ADMIN
- **Operations**: 
  - READ reports (with filters)
  - CREATE report (via `createIssue` helper)
- **DB Tables**: `Report`
- **Access**: Role-based

#### `/src/lib/db/issue.ts` (Helper Functions)
- **`createIssue()`**: CREATE report
  - Validates user role (CITIZEN, DS_OFFICER, ADMIN)
  - Maps category aliases
  - Sets default GPS coordinates if not provided
- **`deleteIssue()`**: DELETE report
  - Requires ADMIN role
- **`updateIssueStatus()`**: UPDATE report status
  - Requires DS_OFFICER or ADMIN role
- **DB Tables**: `Report`
- **Access**: Role-based

#### `/api/reports/public/route.ts` (GET)
- **Purpose**: Public report listing (landing page)
- **Roles**: Public (no auth required)
- **Operations**: READ reports with photos and verifications
- **DB Tables**: `Report`, `Photo`, `Verification`
- **Access**: Public

#### `/api/reports/dashboard/route.ts` (GET)
- **Purpose**: Dashboard reports with role-based filtering
- **Roles**: CITIZEN, NGO_PARTNER, DS_OFFICER, ADMIN
- **Operations**: READ reports
  - CITIZEN: Only their own reports
  - Others: All reports (with optional status filter)
- **DB Tables**: `Report`, `Photo`, `Verification`
- **Access**: Role-based

---

### 2.3 Assignment Management

#### `/api/assignments/route.ts` (POST, PATCH)
- **POST Purpose**: Create assignment (assign report to agency)
- **PATCH Purpose**: Update assignment status
- **Roles**: 
  - POST: DS_OFFICER only
  - PATCH: DS_OFFICER, NGO_PARTNER
- **Operations**: 
  - CREATE assignment (with transaction)
  - UPDATE assignment status (with validation)
  - UPDATE report status (when assigned)
  - CREATE audit log (for every action)
- **DB Tables**: `Assignment`, `Report`, `Agency`, `AuditLog`
- **Access**: Role-based
- **Business Rules**:
  - Report must be in VERIFIED status to assign
  - Agency must be active
  - Status transitions validated (PENDING → ACCEPTED → IN_PROGRESS → COMPLETED)
  - All actions wrapped in transactions

#### `/api/assignments/[id]/route.ts` (GET)
- **Purpose**: Get single assignment by ID
- **Roles**: DS_OFFICER, NGO_PARTNER, ADMIN
- **Operations**: READ assignment with report and agency details
- **DB Tables**: `Assignment`, `Report`, `Agency`
- **Access**: Role-based

---

### 2.4 Agency Management

#### `/api/agencies/route.ts` (GET, POST, PATCH, DELETE)
- **GET Purpose**: List agencies (with type/district filters)
- **POST Purpose**: Create agency
- **PATCH Purpose**: Update agency
- **DELETE Purpose**: Deactivate agency (soft-delete)
- **Roles**: 
  - GET: DS_OFFICER, ADMIN, NGO_PARTNER
  - POST/PATCH/DELETE: DS_OFFICER, ADMIN
- **Operations**: 
  - READ agencies (with filters)
  - CREATE agency (with audit log)
  - UPDATE agency (with audit log, before/after metadata)
  - DELETE agency (soft-delete, with audit log)
- **DB Tables**: `Agency`, `AuditLog`
- **Access**: Role-based
- **Business Rules**:
  - Cannot deactivate/delete agency with existing assignments
  - All write operations wrapped in transactions
  - Full audit trail with metadata

---

### 2.5 Audit Logging

#### `/api/audit-logs/route.ts` (GET)
- **Purpose**: Retrieve system audit logs
- **Roles**: ADMIN only
- **Operations**: READ audit logs with user details
- **DB Tables**: `AuditLog`, `User`
- **Access**: ADMIN only
- **Tracked Actions**:
  - ASSIGNMENT_CREATED
  - ASSIGNMENT_STATUS_UPDATED
  - AGENCY_CREATED
  - AGENCY_UPDATED
  - AGENCY_DEACTIVATED

---

### 2.6 Dashboard & Analytics

#### `/api/dashboard/route.ts` (GET)
- **Purpose**: Public dashboard statistics and analytics
- **Roles**: Public
- **Operations**: READ aggregated data
  - Total reports count
  - Verified count
  - Resolved count
  - Status distribution
  - Category breakdown
  - Recent activity
  - Report locations (for map)
  - Top divisions
  - Weekly trends
  - Resolution timeline
  - Available districts
- **DB Tables**: `Report`
- **Access**: Public

#### `/api/transparency/route.ts` (GET)
- **Purpose**: Public transparency data (all reports)
- **Roles**: Public
- **Operations**: READ all reports (basic fields)
- **DB Tables**: `Report`
- **Access**: Public

---

## 3. Report Lifecycle Flow Across Roles

### 3.1 Complete Flow Diagram

```
[CITIZEN] → [COMMUNITY] → [DS_OFFICER] → [AGENCY/NGO] → [FIELD_TEAM] → [DS_OFFICER] → [ADMIN]
    ↓           ↓              ↓              ↓              ↓              ↓           ↓
  SUBMIT → VERIFY → VERIFIED → ASSIGN → ACCEPTED → IN_PROGRESS → INSPECT → RESOLVED → CLOSE
```

### 3.2 Detailed Role Interactions

#### Phase 1: Report Creation
- **Actor**: CITIZEN (or DS_OFFICER/ADMIN)
- **Endpoint**: `POST /api/reports`
- **DB Operations**:
  1. CREATE Report record
  2. CREATE Photo records (via MinIO upload - separate endpoint)
  3. Status: SUBMITTED
- **Access**: CITIZEN, DS_OFFICER, ADMIN

#### Phase 2: Community Verification
- **Actor**: Any authenticated user (CITIZEN, NGO_PARTNER, DS_OFFICER)
- **Endpoint**: MISSING - `/api/verifications` (not implemented)
- **Expected DB Operations**:
  1. CREATE Verification record
  2. CREATE Photo records (evidence)
  3. UPDATE Report.verifyCount
  4. UPDATE Report.status (if 3+ confirms → VERIFIED)
  5. UPDATE User.trustScore (based on verification accuracy)
- **Access**: All authenticated users
- **Current Status**: NOT IMPLEMENTED

#### Phase 3: DS Officer Assignment
- **Actor**: DS_OFFICER
- **Endpoint**: `POST /api/assignments`
- **DB Operations**:
  1. READ Report (check status = VERIFIED)
  2. READ Agency (check active)
  3. CREATE Assignment record
  4. UPDATE Report.status → ASSIGNED
  5. CREATE AuditLog record
- **Transaction**: Yes (atomic)
- **Access**: DS_OFFICER only

#### Phase 4: Agency Acceptance
- **Actor**: NGO_PARTNER (agency representative)
- **Endpoint**: `PATCH /api/assignments`
- **DB Operations**:
  1. READ Assignment
  2. UPDATE Assignment.status → ACCEPTED
  3. CREATE AuditLog record
- **Transaction**: Yes
- **Access**: DS_OFFICER, NGO_PARTNER

#### Phase 5: Field Inspection
- **Actor**: Field team (agency staff)
- **Endpoint**: MISSING - `/api/inspections` (not implemented)
- **Expected DB Operations**:
  1. CREATE FieldInspection record
  2. CREATE Photo records (evidence)
  3. UPDATE Assignment.status → COMPLETED
  4. UPDATE Report.status → FIELD_VERIFIED or RESOLVED or ESCALATE
  5. CREATE StatusHistory record
  6. CREATE AuditLog record
- **Access**: Agency staff (role not clearly defined)
- **Current Status**: NOT IMPLEMENTED

#### Phase 6: Resolution & Closure
- **Actor**: DS_OFFICER or ADMIN
- **Endpoint**: `PATCH /api/reports/[id]` (missing) or via `updateIssueStatus`
- **DB Operations**:
  1. UPDATE Report.status → RESOLVED or CLOSED
  2. UPDATE Report.resolvedAt
  3. CREATE StatusHistory record
  4. CREATE AuditLog record
- **Access**: DS_OFFICER, ADMIN

---

## 4. Missing CRUD Endpoints

### 4.1 Critical Missing Endpoints

| Entity | Missing Operations | Priority | Notes |
|--------|-------------------|----------|-------|
| **Verification** | POST (create), GET (list), GET (by id) | HIGH | Core feature mentioned in task.md |
| **FieldInspection** | POST (create), GET (list), GET (by id) | HIGH | Core feature for field teams |
| **Report Detail** | GET (by id), PATCH (update), DELETE | HIGH | Cannot view/edit individual reports |
| **StatusHistory** | GET (by report id) | MEDIUM | Important for audit trail |
| **Notification** | POST (create), GET (list), PATCH (mark read) | MEDIUM | User notifications |
| **RoleRequest** | POST (create), GET (list), PATCH (approve/reject) | MEDIUM | Role upgrade workflow |

### 4.2 Incomplete Implementations

| Endpoint | Issue | Recommendation |
|----------|-------|----------------|
| `/api/reports/route.ts` | No DELETE endpoint | Add DELETE with ADMIN role |
| `/api/reports/route.ts` | No PATCH endpoint for updates | Add PATCH for report updates |
| `/api/assignments/route.ts` | No GET endpoint (list) | Add GET for assignment listing |
| `/api/assignments/[id]/route.ts` | No DELETE endpoint | Add DELETE if needed |
| `/api/agencies/route.ts` | DELETE is soft-delete only | Document this behavior |

---

## 5. Role-Based Access Control Summary

| Role | Can Create | Can Read | Can Update | Can Delete | Special Permissions |
|------|-----------|----------|------------|------------|---------------------|
| **CITIZEN** | Reports | Own reports only | Own reports only | None | Verify reports (missing) |
| **NGO_PARTNER** | - | All data | Assignments (status) | None | View assignments |
| **DS_OFFICER** | Reports, Agencies, Assignments | All data | Reports (status), Agencies, Assignments | Agencies (soft) | Assign reports, approve role requests |
| **ADMIN** | All | All | All | All (soft) | View audit logs, manage users |

---

## 6. Database Transaction Patterns

### 6.1 Current Transaction Usage

**Used in:**
- `/api/assignments/route.ts` (POST, PATCH)
- `/api/agencies/route.ts` (POST, PATCH, DELETE)

**Pattern:**
```typescript
await db.$transaction(async (tx) => {
  // Main operation
  const result = await tx.entity.create/update/delete({...});
  
  // Audit log
  await tx.auditLog.create({...});
  
  return result;
});
```

### 6.2 Missing Transaction Wrappers

**Should use transactions:**
- Report creation + photo upload
- Verification creation + trust score update + report status update
- Field inspection + assignment status + report status + status history
- Report status update + status history creation

---

## 7. Audit Trail Coverage

### 7.1 Currently Tracked Actions
- ✅ ASSIGNMENT_CREATED
- ✅ ASSIGNMENT_STATUS_UPDATED
- ✅ AGENCY_CREATED
- ✅ AGENCY_UPDATED
- ✅ AGENCY_DEACTIVATED

### 7.2 Missing Audit Actions
- ❌ REPORT_CREATED
- ❌ REPORT_UPDATED
- ❌ REPORT_DELETED
- ❌ REPORT_STATUS_CHANGED
- ❌ VERIFICATION_CREATED
- ❌ VERIFICATION_DISPUTED
- ❌ INSPECTION_CREATED
- ❌ USER_ROLE_CHANGED
- ❌ ROLE_REQUEST_APPROVED
- ❌ ROLE_REQUEST_REJECTED

---

## 8. Recommendations

### 8.1 Immediate Actions (High Priority)

1. **Implement Verification API**
   - Create `/api/verifications/route.ts`
   - Implement POST for creating verifications
   - Add trust score update logic
   - Add report status escalation (3+ confirms → VERIFIED)
   - Wrap in transaction with audit log

2. **Implement Field Inspection API**
   - Create `/api/inspections/route.ts`
   - Implement POST for creating inspections
   - Add GPS validation
   - Update assignment and report status
   - Create status history
   - Wrap in transaction with audit log

3. **Add Report Detail Endpoints**
   - Create `/api/reports/[id]/route.ts`
   - Implement GET (with full relations)
   - Implement PATCH (for updates)
   - Implement DELETE (ADMIN only)
   - Add status history to response

4. **Add Assignment Listing**
   - Add GET to `/api/assignments/route.ts`
   - Support filtering by status, agency, report

### 8.2 Medium Priority

5. **Implement Notification System**
   - Create `/api/notifications/route.ts`
   - Implement CRUD operations
   - Add real-time notification triggers

6. **Implement Role Request Workflow**
   - Create `/api/role-requests/route.ts`
   - Implement POST (request), GET (list), PATCH (approve/reject)
   - Add admin approval UI

7. **Expand Audit Logging**
   - Add audit logs to all write operations
   - Implement missing audit actions
   - Add IP address tracking consistently

### 8.3 Low Priority

8. **Add Status History API**
   - Create `/api/status-history/route.ts`
   - Implement GET by report ID

9. **Improve Error Handling**
   - Standardize error responses
   - Add detailed error logging
   - Implement retry logic for transactions

10. **Add Data Validation**
    - Strengthen Zod schemas
    - Add business rule validation
    - Implement referential integrity checks

---

## 9. Security Considerations

### 9.1 Current Security Measures
- ✅ Role-based access control via `requireRole()`
- ✅ Clerk authentication integration
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Transaction-based atomic operations

### 9.2 Security Gaps
- ❌ No rate limiting on API endpoints
- ❌ No request size limits
- ❌ IP address not consistently logged
- ❌ No data encryption at rest (managed by DB provider)
- ❌ No field-level security (sensitive data exposure)

---

## 10. Performance Considerations

### 10.1 Current Optimizations
- ✅ Database indexes on foreign keys and search fields
- ✅ Selective field querying (Prisma `select`)
- ✅ Parallel queries with `Promise.all()`

### 10.2 Optimization Opportunities
- Add pagination to list endpoints
- Implement caching for dashboard data
- Add database connection pooling
- Optimize N+1 queries in report listings
- Add read replicas for public endpoints

---

## 11. Next Steps for Implementation

### Phase 1: Core Missing Features (Week 1)
1. Implement Verification API
2. Implement Field Inspection API
3. Add Report Detail endpoints
4. Add Assignment listing

### Phase 2: Enhanced Features (Week 2)
5. Implement Notification system
6. Implement Role Request workflow
7. Expand audit logging coverage

### Phase 3: Polish & Security (Week 3)
8. Add comprehensive error handling
9. Implement rate limiting
10. Add performance optimizations
11. Security audit

---

## 12. Testing Strategy

### 12.1 Unit Tests Needed
- Trust score calculation
- Status transition validation
- Role-based access control
- Transaction rollback scenarios

### 12.2 Integration Tests Needed
- Full report lifecycle (submit → verify → assign → inspect → resolve)
- Multi-role interaction scenarios
- Audit log verification
- Transaction atomicity

### 12.3 E2E Tests Needed
- Citizen submits report
- Community verifies report
- DS officer assigns report
- Agency accepts assignment
- Field team inspects
- Report resolved

---

## Conclusion

The CivicPulse LK platform has a solid foundation with core CRUD operations for reports, assignments, and agencies. However, critical features for the complete report lifecycle are missing:

1. **Verification API** - Essential for community validation
2. **Field Inspection API** - Critical for field team operations
3. **Report Detail endpoints** - Needed for individual report management
4. **Enhanced audit logging** - Required for compliance and debugging

The role-based access control is well-designed but needs consistent implementation across all endpoints. Transaction patterns are used correctly but should be expanded to cover all multi-table operations.

**Recommendation**: Prioritize implementing the missing Verification and Field Inspection APIs, as they are central to the platform's value proposition and are referenced in the task.md as completed features.
