// prisma/seed.ts
// This script seeds the CivicPulse LK database with initial data for development and testing purposes.
// It creates users, agencies, reports, verifications, and photos in a specific order to maintain referential integrity.
// Note: This script is intended for development and testing only. Do not run in production environments.

import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, Language, Category, ReportStatus, Priority, VerificationStatus, AssignmentStatus, InspectionResult } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  console.log('Seeding CivicPulse LK database...');

  // Clean existing data in reverse-dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.fieldInspection.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.report.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.user.deleteMany();

  // ---------------- 1. USERS (20 records - all 7 Role values covered) ----------------
  const userSeed = [
    { clerkId: 'user_2civ001mock', email: 'nimal.perera@gmail.com', firstName: 'Nimal', lastName: 'Perera', role: Role.CITIZEN, trustScore: 62, preferredLang: Language.SI, district: 'Negombo' },
    { clerkId: 'user_2civ002mock', email: 'fathima.rizwan@gmail.com', firstName: 'Fathima', lastName: 'Rizwan', role: Role.CITIZEN, trustScore: 58, preferredLang: Language.EN, district: 'Colombo' },
    { clerkId: 'user_2civ003mock', email: 'sarath.wick@gmail.com', firstName: 'Sarath', lastName: 'Wickramasinghe', role: Role.CITIZEN, trustScore: 71, preferredLang: Language.SI, district: 'Kandy' },
    { clerkId: 'user_2civ004mock', email: 'priya.kanth@gmail.com', firstName: 'Priya', lastName: 'Kanthasamy', role: Role.CITIZEN, trustScore: 55, preferredLang: Language.TA, district: 'Jaffna' },
    { clerkId: 'user_2civ005mock', email: 'dinesh.bandara@gmail.com', firstName: 'Dinesh', lastName: 'Bandara', role: Role.CITIZEN, trustScore: 66, preferredLang: Language.SI, district: 'Kurunegala' },
    { clerkId: 'user_2civ006mock', email: 'ayesha.fernando@gmail.com', firstName: 'Ayesha', lastName: 'Fernando', role: Role.CITIZEN, trustScore: 49, preferredLang: Language.EN, district: 'Galle' },
    { clerkId: 'user_2civ007mock', email: 'kumaran.selva@gmail.com', firstName: 'Kumaran', lastName: 'Selvaraj', role: Role.CITIZEN, trustScore: 60, preferredLang: Language.TA, district: 'Batticaloa' },
    { clerkId: 'user_2civ008mock', email: 'chamari.silva@gmail.com', firstName: 'Chamari', lastName: 'Silva', role: Role.CITIZEN, trustScore: 53, preferredLang: Language.SI, district: 'Matara' },
    { clerkId: 'user_2civ009mock', email: 'ahmed.rushdie@gmail.com', firstName: 'Ahmed', lastName: 'Rushdie', role: Role.CITIZEN, trustScore: 64, preferredLang: Language.EN, district: 'Negombo' },
    { clerkId: 'user_2civ010mock', email: 'ruwan.jaya@gmail.com', firstName: 'Ruwan', lastName: 'Jayasuriya', role: Role.VERIFIER, trustScore: 82, preferredLang: Language.SI, district: 'Negombo' },
    { clerkId: 'user_2civ011mock', email: 'selvi.ramanathan@gmail.com', firstName: 'Selvi', lastName: 'Ramanathan', role: Role.VERIFIER, trustScore: 78, preferredLang: Language.TA, district: 'Jaffna' },
    { clerkId: 'user_2civ012mock', email: 'harsha.dezoysa@gmail.com', firstName: 'Harsha', lastName: 'de Zoysa', role: Role.VERIFIER, trustScore: 75, preferredLang: Language.EN, district: 'Colombo' },
    { clerkId: 'user_2civ013mock', email: 'malini.rathnayake@gmail.com', firstName: 'Malini', lastName: 'Rathnayake', role: Role.VERIFIER, trustScore: 80, preferredLang: Language.SI, district: 'Kandy' },
    { clerkId: 'user_2civ014mock', email: 'ilmaan.ahamed@ds.gov.lk', firstName: 'MJ Ilmaan', lastName: 'Ahamed', role: Role.DS_OFFICER, trustScore: 90, preferredLang: Language.EN, district: 'Negombo' },
    { clerkId: 'user_2civ015mock', email: 'chandrasena@ds.gov.lk', firstName: 'W.A.', lastName: 'Chandrasena', role: Role.DS_OFFICER, trustScore: 88, preferredLang: Language.SI, district: 'Kandy' },
    { clerkId: 'user_2civ016mock', email: 'thevaki@ds.gov.lk', firstName: 'R.', lastName: 'Thevaki', role: Role.DS_OFFICER, trustScore: 85, preferredLang: Language.TA, district: 'Jaffna' },
    { clerkId: 'user_2civ017mock', email: 'sanjeewa.rda@gov.lk', firstName: 'Sanjeewa', lastName: 'Rathnapala', role: Role.AGENCY, trustScore: 70, preferredLang: Language.SI, district: 'Colombo' },
    { clerkId: 'user_2civ018mock', email: 'kavitha.sewalanka@sewalanka.org', firstName: 'Kavitha', lastName: 'Sinnathurai', role: Role.NGO, trustScore: 68, preferredLang: Language.TA, district: 'Colombo' },
    { clerkId: 'user_2civ019mock', email: 'priyantha.cleannegombo@gmail.com', firstName: 'Priyantha', lastName: 'Kumara', role: Role.VOLUNTEER, trustScore: 72, preferredLang: Language.SI, district: 'Negombo' },
    { clerkId: 'user_2civ020mock', email: 'admin@civicpulse.lk', firstName: 'System', lastName: 'Administrator', role: Role.ADMIN, trustScore: 100, preferredLang: Language.EN, district: 'Colombo' },
  ];

  const users = [];
  for (const u of userSeed) {
    const created = await prisma.user.create({ data: u });
    users.push(created);
  }

  const citizens = users.filter(u => u.role === Role.CITIZEN);
  const verifiers = users.filter(u => u.role === Role.VERIFIER);
  const dsOfficers = users.filter(u => u.role === Role.DS_OFFICER);
  const fieldAgentRoles: Role[] = [Role.AGENCY, Role.NGO, Role.VOLUNTEER];
  const fieldAgents = users.filter(u => fieldAgentRoles.includes(u.role));
  const admin = users.find(u => u.role === Role.ADMIN)!;

  // ---------------- 2. AGENCIES (20 records) ----------------
  const agencySeed = [
    { name: 'Road Development Authority (RDA) - Western', type: 'GOVERNMENT', district: 'Colombo', description: 'Responsible for national and provincial road maintenance', contactEmail: 'road@example.org', contactPhone: '+94112300000' },
    { name: 'National Water Supply & Drainage Board', type: 'GOVERNMENT', district: 'Colombo', description: 'Water supply and drainage infrastructure authority', contactEmail: 'national@example.org', contactPhone: '+94112300000' },
    { name: 'Ceylon Electricity Board (CEB)', type: 'GOVERNMENT', district: 'Colombo', description: 'National electricity infrastructure authority', contactEmail: 'ceylon@example.org', contactPhone: '+94112300000' },
    { name: 'Sri Lanka Police - Traffic Division', type: 'GOVERNMENT', district: 'Colombo', description: 'Traffic and road safety enforcement', contactEmail: 'sri@example.org', contactPhone: '+94112300000' },
    { name: 'Central Environmental Authority (CEA)', type: 'GOVERNMENT', district: 'Colombo', description: 'Environmental protection and sanitation oversight', contactEmail: 'central@example.org', contactPhone: '+94112300000' },
    { name: 'Colombo Municipal Council', type: 'GOVERNMENT', district: 'Colombo', description: 'Urban services for Colombo district', contactEmail: 'colombo@example.org', contactPhone: '+94112300000' },
    { name: 'Negombo Municipal Council', type: 'GOVERNMENT', district: 'Negombo', description: 'Urban services for Negombo district', contactEmail: 'negombo@example.org', contactPhone: '+94112300000' },
    { name: 'Kandy Municipal Council', type: 'GOVERNMENT', district: 'Kandy', description: 'Urban services for Kandy district', contactEmail: 'kandy@example.org', contactPhone: '+94112300000' },
    { name: 'Galle Municipal Council', type: 'GOVERNMENT', district: 'Galle', description: 'Urban services for Galle district', contactEmail: 'galle@example.org', contactPhone: '+94112300000' },
    { name: 'Jaffna Municipal Council', type: 'GOVERNMENT', district: 'Jaffna', description: 'Urban services for Jaffna district', contactEmail: 'jaffna@example.org', contactPhone: '+94112300000' },
    { name: 'Sarvodaya Shramadana Movement', type: 'NGO', district: 'Colombo', description: 'Community development NGO', contactEmail: 'sarvodaya@example.org', contactPhone: '+94112300000' },
    { name: 'Sewalanka Foundation', type: 'NGO', district: 'Colombo', description: 'Community development NGO', contactEmail: 'sewalanka@example.org', contactPhone: '+94112300000' },
    { name: 'Sri Lanka Red Cross Society', type: 'NGO', district: 'Colombo', description: 'Disaster relief and community welfare', contactEmail: 'sri@example.org', contactPhone: '+94112300000' },
    { name: 'Rotary Club of Negombo', type: 'NGO', district: 'Negombo', description: 'Civic welfare service club', contactEmail: 'rotary@example.org', contactPhone: '+94112300000' },
    { name: 'Lions Club of Kandy', type: 'NGO', district: 'Kandy', description: 'Civic welfare service club', contactEmail: 'lions@example.org', contactPhone: '+94112300000' },
    { name: 'National Building Research Organisation (NBRO)', type: 'GOVERNMENT', district: 'Colombo', description: 'Structural and landslide risk assessment', contactEmail: 'national@example.org', contactPhone: '+94112300000' },
    { name: 'Disaster Management Centre (DMC)', type: 'GOVERNMENT', district: 'Colombo', description: 'National disaster response coordination', contactEmail: 'disaster@example.org', contactPhone: '+94112300000' },
    { name: 'Clean Negombo Initiative', type: 'VOLUNTEER_TEAM', district: 'Negombo', description: 'Local grassroots volunteer cleanup group', contactEmail: 'clean@example.org', contactPhone: '+94112300000' },
    { name: 'University CSR Volunteer Network - SLTC', type: 'CSR', district: 'Negombo', description: 'Student CSR volunteer network', contactEmail: 'university@example.org', contactPhone: '+94112300000' },
    { name: 'Ministry of Urban Development & Housing', type: 'GOVERNMENT', district: 'Colombo', description: 'National urban planning authority', contactEmail: 'ministry@example.org', contactPhone: '+94112300000' },
  ];

  const agencies = [];
  for (const a of agencySeed) {
    const created = await prisma.agency.create({ data: a });
    agencies.push(created);
  }

  // ---------------- 3. REPORTS (20 records) ----------------
  const reportSeed = [
    { citizenIdx: 0, category: Category.ROAD_DAMAGE, title: 'Large pothole near Negombo bus stand', description: 'Deep pothole causing a traffic hazard near the main bus stand, worsened by recent rains.', latitude: 7.2083, longitude: 79.8358, address: 'Colombo Road, Negombo', district: 'Negombo', status: ReportStatus.VERIFIED, priority: Priority.HIGH, aiConfidence: 0.91, verifyCount: 4, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 1, category: Category.DRAINAGE, title: 'Blocked storm drain flooding Galle Road', description: 'Storm drain choked with debris causing waterlogging on Galle Road during rain.', latitude: 6.9271, longitude: 79.8612, address: 'Galle Road, Colombo 03', district: 'Colombo', status: ReportStatus.ASSIGNED, priority: Priority.CRITICAL, aiConfidence: 0.88, verifyCount: 5, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 2, category: Category.STREETLIGHT, title: 'Streetlights out on Peradeniya Road', description: 'Three consecutive streetlights not working, dark stretch is unsafe at night.', latitude: 7.2906, longitude: 80.6337, address: 'Peradeniya Road, Kandy', district: 'Kandy', status: ReportStatus.IN_PROGRESS, priority: Priority.MEDIUM, aiConfidence: 0.76, verifyCount: 3, disputeCount: 1, isDuplicate: false,  },
    { citizenIdx: 3, category: Category.SIDEWALK, title: 'Cracked footpath near Jaffna hospital', description: 'Uneven and cracked footpath tiles pose a fall risk for pedestrians and patients.', latitude: 9.6615, longitude: 80.0255, address: 'Hospital Road, Jaffna', district: 'Jaffna', status: ReportStatus.SUBMITTED, priority: Priority.MEDIUM, aiConfidence: 0.62, verifyCount: 0, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 4, category: Category.WATER_SUPPLY, title: 'Water pipeline leaking on Puttalam Road', description: 'Continuous water leak from an underground pipeline wasting water and damaging the road surface.', latitude: 7.4863, longitude: 80.3623, address: 'Puttalam Road, Kurunegala', district: 'Kurunegala', status: ReportStatus.VERIFIED, priority: Priority.HIGH, aiConfidence: 0.85, verifyCount: 3, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 5, category: Category.OTHER, title: 'Fallen tree blocking lighthouse street', description: 'A large tree fell after a storm and is blocking half the road.', latitude: 6.0535, longitude: 80.221, address: 'Lighthouse Street, Galle', district: 'Galle', status: ReportStatus.RESOLVED, priority: Priority.CRITICAL, aiConfidence: 0.95, verifyCount: 6, disputeCount: 0, isDuplicate: false, resolvedAt: new Date(), },
    { citizenIdx: 6, category: Category.WASTE, title: 'Garbage pileup near Batticaloa market', description: 'Uncollected garbage for over a week attracting stray animals and creating odor.', latitude: 7.717, longitude: 81.6924, address: 'Trinco Road, Batticaloa', district: 'Batticaloa', status: ReportStatus.ASSIGNED, priority: Priority.MEDIUM, aiConfidence: 0.7, verifyCount: 3, disputeCount: 1, isDuplicate: false,  },
    { citizenIdx: 7, category: Category.PUBLIC_BUILDING, title: 'Broken bench at Matara public park', description: 'Public bench broken and unsafe to use in the central park.', latitude: 5.9549, longitude: 80.555, address: 'Station Road, Matara', district: 'Matara', status: ReportStatus.SUBMITTED, priority: Priority.LOW, aiConfidence: 0.4, verifyCount: 1, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 8, category: Category.BRIDGE, title: 'Damaged culvert near Gampaha school', description: 'Culvert near the school entrance has a collapsed section, posing a risk to children.', latitude: 7.0917, longitude: 79.9997, address: 'Divulapitiya Road, Gampaha', district: 'Gampaha', status: ReportStatus.VERIFIED, priority: Priority.CRITICAL, aiConfidence: 0.93, verifyCount: 5, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 0, category: Category.TRAFFIC_SIGNAL, title: 'Faulty traffic signal in Anuradhapura town', description: 'Traffic light stuck on red causing congestion at the main junction.', latitude: 8.3114, longitude: 80.4037, address: 'Maithripala Mw, Anuradhapura', district: 'Anuradhapura', status: ReportStatus.IN_PROGRESS, priority: Priority.CRITICAL, aiConfidence: 0.89, verifyCount: 4, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 1, category: Category.WASTE, title: 'Illegal dumping near Negombo canal', description: 'Construction waste dumped illegally along the canal bank.', latitude: 7.2083, longitude: 79.8358, address: 'Colombo Road, Negombo', district: 'Negombo', status: ReportStatus.UNDER_VERIFICATION, priority: Priority.MEDIUM, aiConfidence: 0.55, verifyCount: 2, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 2, category: Category.DRAINAGE, title: 'Sewage overflow near Colombo Fort', description: 'Manhole overflowing with sewage near the railway station entrance.', latitude: 6.9271, longitude: 79.8612, address: 'Galle Road, Colombo 03', district: 'Colombo', status: ReportStatus.ASSIGNED, priority: Priority.CRITICAL, aiConfidence: 0.94, verifyCount: 6, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 3, category: Category.PUBLIC_BUILDING, title: 'Unsanitary public toilet in Kandy', description: 'Public toilet facility damaged and unhygienic near the lake.', latitude: 7.2906, longitude: 80.6337, address: 'Peradeniya Road, Kandy', district: 'Kandy', status: ReportStatus.SUBMITTED, priority: Priority.LOW, aiConfidence: 0.35, verifyCount: 1, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 4, category: Category.PUBLIC_BUILDING, title: 'Broken playground swing in Jaffna', description: 'Swing set broken with sharp edges exposed, a danger for children.', latitude: 9.6615, longitude: 80.0255, address: 'Hospital Road, Jaffna', district: 'Jaffna', status: ReportStatus.VERIFIED, priority: Priority.MEDIUM, aiConfidence: 0.68, verifyCount: 3, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 5, category: Category.OTHER, title: 'Damaged bus shelter roof in Kurunegala', description: 'Bus shelter roof partially collapsed after strong winds.', latitude: 7.4863, longitude: 80.3623, address: 'Puttalam Road, Kurunegala', district: 'Kurunegala', status: ReportStatus.SUBMITTED, priority: Priority.LOW, aiConfidence: 0.42, verifyCount: 1, disputeCount: 1, isDuplicate: false,  },
    { citizenIdx: 6, category: Category.OTHER, title: 'Exposed wiring near Galle bus stand', description: 'Exposed live wiring hanging low near the bus stand, an urgent safety risk.', latitude: 6.0535, longitude: 80.221, address: 'Lighthouse Street, Galle', district: 'Galle', status: ReportStatus.IN_PROGRESS, priority: Priority.CRITICAL, aiConfidence: 0.97, verifyCount: 7, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 7, category: Category.DRAINAGE, title: 'Waterlogged street after monsoon in Matara', description: 'Recurrent flooding on the main street after every heavy rain.', latitude: 5.9549, longitude: 80.555, address: 'Station Road, Matara', district: 'Matara', status: ReportStatus.VERIFIED, priority: Priority.HIGH, aiConfidence: 0.8, verifyCount: 4, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 8, category: Category.PUBLIC_BUILDING, title: 'Cracked school boundary wall in Anuradhapura', description: 'Boundary wall of a primary school has visible cracks and may collapse.', latitude: 8.3114, longitude: 80.4037, address: 'Maithripala Mw, Anuradhapura', district: 'Anuradhapura', status: ReportStatus.ASSIGNED, priority: Priority.HIGH, aiConfidence: 0.84, verifyCount: 4, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 0, category: Category.OTHER, title: 'Stray dog pack near Gampaha market', description: 'Aggressive stray dog pack causing safety concerns for market visitors.', latitude: 7.0917, longitude: 79.9997, address: 'Divulapitiya Road, Gampaha', district: 'Gampaha', status: ReportStatus.SUBMITTED, priority: Priority.LOW, aiConfidence: 0.38, verifyCount: 1, disputeCount: 0, isDuplicate: false,  },
    { citizenIdx: 1, category: Category.ROAD_DAMAGE, title: 'Pothole cluster on Trinco Road', description: 'Multiple potholes and a cracked surface stretch make the road nearly impassable. Duplicate of an existing report on the same stretch.', latitude: 7.717, longitude: 81.6924, address: 'Trinco Road, Batticaloa', district: 'Batticaloa', status: ReportStatus.REJECTED, priority: Priority.LOW, aiConfidence: 0.3, verifyCount: 0, disputeCount: 2, isDuplicate: true,  },
  ];

  const reports = [];
  for (const r of reportSeed) {
    const { citizenIdx, ...data } = r;
    const created = await prisma.report.create({ data: { ...data, citizenId: citizens[citizenIdx % citizens.length].id } });
    reports.push(created);
  }

  // Mark report #20 (index 19) as a duplicate of report #6 (index 5), matching the Trinco Road note above
  await prisma.report.update({ where: { id: reports[19].id }, data: { duplicateOfId: reports[5].id } });

  // ---------------- 4. VERIFICATIONS (20 records) ----------------
  const verificationSeed = [
    { reportIdx: 0, verifierIdx: 0, status: VerificationStatus.CONFIRMED, comment: 'Checked the location, the report is accurate.' },
    { reportIdx: 1, verifierIdx: 1, status: VerificationStatus.CONFIRMED, comment: 'Verified in person, matches the description exactly.' },
    { reportIdx: 2, verifierIdx: 2, status: VerificationStatus.CONFIRMED, comment: 'Checked the location, the report is accurate.' },
    { reportIdx: 3, verifierIdx: 3, status: VerificationStatus.CONFIRMED, comment: 'Verified in person, matches the description exactly.' },
    { reportIdx: 4, verifierIdx: 0, status: VerificationStatus.CONFIRMED, comment: 'Can confirm, this has been an issue for weeks.' },
    { reportIdx: 5, verifierIdx: 1, status: VerificationStatus.CONFIRMED, comment: 'Confirmed, I pass by this location daily and the issue is real.' },
    { reportIdx: 6, verifierIdx: 2, status: VerificationStatus.CONFIRMED, comment: 'Checked the location, the report is accurate.' },
    { reportIdx: 7, verifierIdx: 3, status: VerificationStatus.DISPUTED, comment: 'Visited the site, the issue seems already partially resolved.' },
    { reportIdx: 8, verifierIdx: 0, status: VerificationStatus.CONFIRMED, comment: 'Confirmed, I pass by this location daily and the issue is real.' },
    { reportIdx: 9, verifierIdx: 1, status: VerificationStatus.CONFIRMED, comment: 'Verified in person, matches the description exactly.' },
    { reportIdx: 10, verifierIdx: 2, status: VerificationStatus.DISPUTED, comment: 'Visited the site, the issue seems already partially resolved.' },
    { reportIdx: 11, verifierIdx: 3, status: VerificationStatus.DISPUTED, comment: 'Could not locate the exact issue described.' },
    { reportIdx: 12, verifierIdx: 0, status: VerificationStatus.CONFIRMED, comment: 'Verified in person, matches the description exactly.' },
    { reportIdx: 13, verifierIdx: 1, status: VerificationStatus.CONFIRMED, comment: 'Can confirm, this has been an issue for weeks.' },
    { reportIdx: 14, verifierIdx: 2, status: VerificationStatus.CONFIRMED, comment: 'Confirmed, I pass by this location daily and the issue is real.' },
    { reportIdx: 15, verifierIdx: 3, status: VerificationStatus.CONFIRMED, comment: 'Can confirm, this has been an issue for weeks.' },
    { reportIdx: 16, verifierIdx: 0, status: VerificationStatus.CONFIRMED, comment: 'Confirmed, I pass by this location daily and the issue is real.' },
    { reportIdx: 17, verifierIdx: 1, status: VerificationStatus.NEEDS_INFO, comment: 'Location pin seems slightly off from the described address.' },
    { reportIdx: 0, verifierIdx: 2, status: VerificationStatus.DISPUTED, comment: 'Could not locate the exact issue described.' },
    { reportIdx: 1, verifierIdx: 3, status: VerificationStatus.CONFIRMED, comment: 'Confirmed, I pass by this location daily and the issue is real.' },
  ];

  const verifications = [];
  const usedPairs = new Set();
  for (const v of verificationSeed) {
    const key = `${v.reportIdx}-${v.verifierIdx}`;
    if (usedPairs.has(key)) continue; // enforce @@unique([reportId, verifierId])
    usedPairs.add(key);
    const created = await prisma.verification.create({
      data: {
        reportId: reports[v.reportIdx].id,
        verifierId: verifiers[v.verifierIdx].id,
        status: v.status,
        comment: v.comment,
        latitude: reports[v.reportIdx].latitude,
        longitude: reports[v.reportIdx].longitude,
      },
    });
    verifications.push(created);
  }

  // ---------------- 5. PHOTOS (18 records) ----------------
  const photoSeed = [
    { reportIdx: 0, caption: 'Pothole before repair', key: 'reports/1/pothole-before-repair.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/1/pothole-before-repair.jpg' },
    { reportIdx: 0, caption: 'Pothole after repair, resurfaced', key: 'reports/1/pothole-after-repair-resurface.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/1/pothole-after-repair-resurface.jpg' },
    { reportIdx: 1, caption: 'Storm drain choked with debris', key: 'reports/2/storm-drain-choked-with-debris.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/2/storm-drain-choked-with-debris.jpg' },
    { reportIdx: 2, caption: 'Non-functional streetlights at dusk', key: 'reports/3/non-functional-streetlights-at.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/3/non-functional-streetlights-at.jpg' },
    { reportIdx: 4, caption: 'Pipeline leak close-up', key: 'reports/5/pipeline-leak-close-up.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/5/pipeline-leak-close-up.jpg' },
    { reportIdx: 5, caption: 'Fallen tree obstructing road', key: 'reports/6/fallen-tree-obstructing-road.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/6/fallen-tree-obstructing-road.jpg' },
    { reportIdx: 5, caption: 'Road cleared after tree removal', key: 'reports/6/road-cleared-after-tree-remova.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/6/road-cleared-after-tree-remova.jpg' },
    { reportIdx: 6, caption: 'Garbage accumulation at market', key: 'reports/7/garbage-accumulation-at-market.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/7/garbage-accumulation-at-market.jpg' },
    { reportIdx: 8, caption: 'Close-up of culvert crack', key: 'reports/9/close-up-of-culvert-crack.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/9/close-up-of-culvert-crack.jpg' },
    { reportIdx: 8, caption: 'NBRO inspection team on site', key: 'reports/9/nbro-inspection-team-on-site.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/9/nbro-inspection-team-on-site.jpg' },
    { reportIdx: 9, caption: 'Faulty traffic signal stuck on red', key: 'reports/10/faulty-traffic-signal-stuck-on.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/10/faulty-traffic-signal-stuck-on.jpg' },
    { reportIdx: 11, caption: 'Overflowing manhole near station', key: 'reports/12/overflowing-manhole-near-stati.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/12/overflowing-manhole-near-stati.jpg' },
    { reportIdx: 13, caption: 'Broken playground swing with exposed edge', key: 'reports/14/broken-playground-swing-with-e.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/14/broken-playground-swing-with-e.jpg' },
    { reportIdx: 15, caption: 'Exposed live wiring near bus stand', key: 'reports/16/exposed-live-wiring-near-bus-s.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/16/exposed-live-wiring-near-bus-s.jpg' },
    { reportIdx: 15, caption: 'CEB team repairing wiring', key: 'reports/16/ceb-team-repairing-wiring.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/16/ceb-team-repairing-wiring.jpg' },
    { reportIdx: 16, caption: 'Flood-prone street after monsoon rain', key: 'reports/17/flood-prone-street-after-monso.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/17/flood-prone-street-after-monso.jpg' },
    { reportIdx: 17, caption: 'Cracked school boundary wall', key: 'reports/18/cracked-school-boundary-wall.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/18/cracked-school-boundary-wall.jpg' },
    { reportIdx: 1, caption: 'Drain after debris removal', key: 'reports/2/drain-after-debris-removal.jpg', url: 'https://civicpulse-lk.s3.minio.local/reports/2/drain-after-debris-removal.jpg' },
  ];

  for (const p of photoSeed) {
    await prisma.photo.create({
      data: { reportId: reports[p.reportIdx].id, caption: p.caption, key: p.key, url: p.url },
    });
  }

  // ---------------- 6. ASSIGNMENTS (18 records) ----------------
  const assignmentSeed = [
    { reportIdx: 0, agentIdx: 0, status: AssignmentStatus.COMPLETED, notes: 'RDA notified, pothole repaired within 5 days.' },
    { reportIdx: 1, agentIdx: 1, status: AssignmentStatus.IN_PROGRESS, notes: 'NWSDB team dispatched to clear the drain.' },
    { reportIdx: 2, agentIdx: 1, status: AssignmentStatus.IN_PROGRESS, notes: 'CEB Kandy scheduled bulb replacement.' },
    { reportIdx: 4, agentIdx: 0, status: AssignmentStatus.ACCEPTED, notes: 'NWSDB inspecting pipeline leak.' },
    { reportIdx: 5, agentIdx: 2, status: AssignmentStatus.COMPLETED, notes: 'Urban Development team removed the fallen tree.' },
    { reportIdx: 6, agentIdx: 1, status: AssignmentStatus.PENDING, notes: 'Awaiting confirmation from Colombo Municipal Council.' },
    { reportIdx: 8, agentIdx: 1, status: AssignmentStatus.ACCEPTED, notes: 'NBRO to assess culvert structural risk.' },
    { reportIdx: 9, agentIdx: 0, status: AssignmentStatus.IN_PROGRESS, notes: 'Traffic Police notified for signal repair.' },
    { reportIdx: 11, agentIdx: 2, status: AssignmentStatus.ACCEPTED, notes: 'CEA notified regarding sewage overflow.' },
    { reportIdx: 13, agentIdx: 1, status: AssignmentStatus.PENDING, notes: 'Sewalanka Foundation to inspect playground equipment.' },
    { reportIdx: 16, agentIdx: 0, status: AssignmentStatus.COMPLETED, notes: 'NWSDB resolved recurring flooding with a drain upgrade.' },
    { reportIdx: 17, agentIdx: 1, status: AssignmentStatus.ACCEPTED, notes: 'NBRO assessing boundary wall structural integrity.' },
    { reportIdx: 1, agentIdx: 2, status: AssignmentStatus.ACCEPTED, notes: 'Sarvodaya volunteers assisting with canal cleanup.' },
    { reportIdx: 8, agentIdx: 0, status: AssignmentStatus.PENDING, notes: 'Kandy Municipal Council notified for culvert repair.' },
    { reportIdx: 15, agentIdx: 1, status: AssignmentStatus.IN_PROGRESS, notes: 'CEB emergency team dispatched for exposed wiring.' },
    { reportIdx: 5, agentIdx: 2, status: AssignmentStatus.COMPLETED, notes: 'Clean Negombo Initiative volunteers cleared remaining debris.' },
    { reportIdx: 11, agentIdx: 0, status: AssignmentStatus.IN_PROGRESS, notes: 'DMC coordinating emergency sewage response.' },
    { reportIdx: 9, agentIdx: 1, status: AssignmentStatus.ACCEPTED, notes: 'Traffic Police reviewing signal timing.' },
  ];

  const assignments = [];
  for (const a of assignmentSeed) {
    const dsOfficer = dsOfficers[a.reportIdx % dsOfficers.length];
    const agent = fieldAgents[a.agentIdx % fieldAgents.length];
    const created = await prisma.assignment.create({
      data: {
        reportId: reports[a.reportIdx].id,
        dsOfficerId: dsOfficer.id,
        assignedToId: agent.id,
        status: a.status,
        notes: a.notes,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        acceptedAt: a.status !== AssignmentStatus.PENDING ? new Date() : null,
        completedAt: a.status === AssignmentStatus.COMPLETED ? new Date() : null,
      },
    });
    assignments.push(created);
  }

  // ---------------- 7. FIELD INSPECTIONS (16 records) ----------------
  const inspectionSeed = [
    { assignmentIdx: 0, result: InspectionResult.CONFIRMED_RESOLVED, findings: 'Pothole fully resurfaced, road safe for traffic.' },
    { assignmentIdx: 1, result: InspectionResult.PARTIALLY_RESOLVED, findings: 'Drain partially cleared, follow-up cleaning scheduled.' },
    { assignmentIdx: 2, result: InspectionResult.NOT_RESOLVED, findings: 'Streetlights still non-functional, awaiting replacement parts.' },
    { assignmentIdx: 3, result: InspectionResult.CONFIRMED_RESOLVED, findings: 'Pipeline leak sealed, no further water loss observed.' },
    { assignmentIdx: 4, result: InspectionResult.CONFIRMED_RESOLVED, findings: 'Tree fully removed, road cleared and safe.' },
    { assignmentIdx: 6, result: InspectionResult.ESCALATE, findings: 'Culvert damage more severe than reported, needs structural engineer.' },
    { assignmentIdx: 7, result: InspectionResult.NOT_RESOLVED, findings: 'Traffic signal still malfunctioning, part on order.' },
    { assignmentIdx: 8, result: InspectionResult.PARTIALLY_RESOLVED, findings: 'Sewage overflow contained, permanent fix pending.' },
    { assignmentIdx: 10, result: InspectionResult.CONFIRMED_RESOLVED, findings: 'Flooding resolved after drain capacity upgrade.' },
    { assignmentIdx: 11, result: InspectionResult.ESCALATE, findings: 'Wall crack indicates foundation issue, escalated to NBRO HQ.' },
    { assignmentIdx: 12, result: InspectionResult.PARTIALLY_RESOLVED, findings: 'Canal cleanup completed, dumping signage installed.' },
    { assignmentIdx: 13, result: InspectionResult.NOT_RESOLVED, findings: 'Culvert repair not yet started, awaiting municipal budget approval.' },
    { assignmentIdx: 14, result: InspectionResult.CONFIRMED_RESOLVED, findings: 'Exposed wiring safely insulated and secured.' },
    { assignmentIdx: 5, result: InspectionResult.CONFIRMED_RESOLVED, findings: 'Remaining debris cleared by volunteer team.' },
    { assignmentIdx: 9, result: InspectionResult.PARTIALLY_RESOLVED, findings: 'Emergency response contained overflow, monitoring ongoing.' },
    { assignmentIdx: 16, result: InspectionResult.NOT_RESOLVED, findings: 'Signal timing adjustment pending traffic study.' },
  ];

  for (const ins of inspectionSeed) {
    const assignment = assignments[ins.assignmentIdx % assignments.length];
    const inspector = fieldAgents[ins.assignmentIdx % fieldAgents.length];
    await prisma.fieldInspection.create({
      data: {
        assignmentId: assignment.id,
        inspectorId: inspector.id,
        findings: ins.findings,
        result: ins.result,
        latitude: 7.0 + (ins.assignmentIdx % 5) * 0.1,
        longitude: 80.0 + (ins.assignmentIdx % 5) * 0.1,
      },
    });
  }

  // ---------------- 8. STATUS HISTORY (20 records) ----------------
  const statusHistorySeed = [
    { reportIdx: 0, fromStatus: null, toStatus: ReportStatus.SUBMITTED, reason: 'Citizen submitted the report.' },
    { reportIdx: 0, fromStatus: ReportStatus.SUBMITTED, toStatus: ReportStatus.UNDER_VERIFICATION, reason: 'Community verification started.' },
    { reportIdx: 0, fromStatus: ReportStatus.UNDER_VERIFICATION, toStatus: ReportStatus.VERIFIED, reason: 'Reached required confirmation threshold.' },
    { reportIdx: 1, fromStatus: null, toStatus: ReportStatus.SUBMITTED, reason: 'Citizen submitted the report.' },
    { reportIdx: 1, fromStatus: ReportStatus.SUBMITTED, toStatus: ReportStatus.VERIFIED, reason: 'Verified quickly due to high confirmation count.' },
    { reportIdx: 1, fromStatus: ReportStatus.VERIFIED, toStatus: ReportStatus.ASSIGNED, reason: 'Assigned to NWSDB by DS Office.' },
    { reportIdx: 2, fromStatus: null, toStatus: ReportStatus.SUBMITTED, reason: 'Citizen submitted the report.' },
    { reportIdx: 2, fromStatus: ReportStatus.SUBMITTED, toStatus: ReportStatus.VERIFIED, reason: 'Verified by community.' },
    { reportIdx: 2, fromStatus: ReportStatus.VERIFIED, toStatus: ReportStatus.ASSIGNED, reason: 'Assigned to CEB.' },
    { reportIdx: 2, fromStatus: ReportStatus.ASSIGNED, toStatus: ReportStatus.IN_PROGRESS, reason: 'CEB began repair work.' },
    { reportIdx: 5, fromStatus: null, toStatus: ReportStatus.SUBMITTED, reason: 'Citizen submitted the report.' },
    { reportIdx: 5, fromStatus: ReportStatus.SUBMITTED, toStatus: ReportStatus.VERIFIED, reason: 'Verified by community.' },
    { reportIdx: 5, fromStatus: ReportStatus.VERIFIED, toStatus: ReportStatus.ASSIGNED, reason: 'Assigned to Ministry of Urban Development.' },
    { reportIdx: 5, fromStatus: ReportStatus.ASSIGNED, toStatus: ReportStatus.IN_PROGRESS, reason: 'Tree removal team dispatched.' },
    { reportIdx: 5, fromStatus: ReportStatus.IN_PROGRESS, toStatus: ReportStatus.FIELD_VERIFIED, reason: 'Field inspection confirmed resolution.' },
    { reportIdx: 5, fromStatus: ReportStatus.FIELD_VERIFIED, toStatus: ReportStatus.RESOLVED, reason: 'Report marked resolved after inspection.' },
    { reportIdx: 19, fromStatus: null, toStatus: ReportStatus.SUBMITTED, reason: 'Citizen submitted the report.' },
    { reportIdx: 19, fromStatus: ReportStatus.SUBMITTED, toStatus: ReportStatus.UNDER_VERIFICATION, reason: 'Community verification started.' },
    { reportIdx: 19, fromStatus: ReportStatus.UNDER_VERIFICATION, toStatus: ReportStatus.REJECTED, reason: 'Rejected as a duplicate of an existing verified report.' },
    { reportIdx: 8, fromStatus: ReportStatus.VERIFIED, toStatus: ReportStatus.ASSIGNED, reason: 'Assigned to NBRO for structural assessment.' },
  ];

  for (const [i, sh] of statusHistorySeed.entries()) {
    await prisma.statusHistory.create({
      data: {
        reportId: reports[sh.reportIdx].id,
        fromStatus: sh.fromStatus,
        toStatus: sh.toStatus,
        reason: sh.reason,
        changedBy: i % 3 === 0 ? admin.id : dsOfficers[i % dsOfficers.length].id,
      },
    });
  }

  // ---------------- 9. NOTIFICATIONS (16 records) ----------------
  const notificationSeed = [
    { userIdx: 0, title: 'Report Verified', message: 'Your report \'Large pothole near Negombo bus stand\' has been verified by the community.', type: 'REPORT_UPDATE' },
    { userIdx: 1, title: 'Report Assigned', message: 'Your report has been assigned to NWSDB.', type: 'ASSIGNMENT' },
    { userIdx: 2, title: 'New Verification', message: 'Someone verified your streetlight report.', type: 'VERIFICATION' },
    { userIdx: 4, title: 'Pipeline Leak Verified', message: 'Your water leak report has been verified.', type: 'REPORT_UPDATE' },
    { userIdx: 5, title: 'Report Resolved', message: 'Your fallen tree report has been marked resolved.', type: 'REPORT_UPDATE' },
    { userIdx: 6, title: 'Report Assigned', message: 'Your garbage report has been assigned to Colombo Municipal Council.', type: 'ASSIGNMENT' },
    { userIdx: 8, title: 'Escalation Notice', message: 'Your culvert report has been escalated to NBRO for structural review.', type: 'REPORT_UPDATE' },
    { userIdx: 9, title: 'Report In Progress', message: 'Traffic Police has started work on your signal report.', type: 'ASSIGNMENT' },
    { userIdx: 10, title: 'Verifier Task', message: 'A new report near you is awaiting community verification.', type: 'VERIFICATION' },
    { userIdx: 11, title: 'Verifier Task', message: 'A new sewage overflow report near you needs verification.', type: 'VERIFICATION' },
    { userIdx: 14, title: 'DS Officer Task', message: 'A new report requires assignment review.', type: 'ASSIGNMENT' },
    { userIdx: 15, title: 'DS Officer Task', message: 'A verified report requires agency assignment.', type: 'ASSIGNMENT' },
    { userIdx: 17, title: 'NGO Task', message: 'Sewalanka Foundation has been assigned a new inspection task.', type: 'ASSIGNMENT' },
    { userIdx: 19, title: 'Report Rejected', message: 'Your report was marked as a duplicate and closed.', type: 'REPORT_UPDATE' },
    { userIdx: 18, title: 'Volunteer Task', message: 'Clean Negombo Initiative has a new cleanup assignment.', type: 'ASSIGNMENT' },
    { userIdx: 16, title: 'Agency Task', message: 'RDA has a new road damage report pending review.', type: 'ASSIGNMENT' },
  ];

  for (const n of notificationSeed) {
    await prisma.notification.create({
      data: {
        userId: users[n.userIdx].id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: Math.random() > 0.5,
      },
    });
  }

  // ---------------- 10. AUDIT LOGS (16 records) ----------------
  const auditSeed = [
    { userIdx: 0, action: 'CREATE', entity: 'Report', entityRefIdx: 0 },
    { userIdx: 9, action: 'VERIFY', entity: 'Verification', entityRefIdx: 0 },
    { userIdx: 13, action: 'ASSIGN', entity: 'Assignment', entityRefIdx: 0 },
    { userIdx: 13, action: 'UPDATE', entity: 'Report', entityRefIdx: 1 },
    { userIdx: 16, action: 'ACCEPT', entity: 'Assignment', entityRefIdx: 0 },
    { userIdx: 0, action: 'CREATE', entity: 'Report', entityRefIdx: 5 },
    { userIdx: 10, action: 'VERIFY', entity: 'Verification', entityRefIdx: 4 },
    { userIdx: 14, action: 'ASSIGN', entity: 'Assignment', entityRefIdx: 4 },
    { userIdx: 15, action: 'REJECT', entity: 'Report', entityRefIdx: 19 },
    { userIdx: 19, action: 'ADMIN_REVIEW', entity: 'User', entityRefIdx: 8 },
    { userIdx: 17, action: 'COMPLETE', entity: 'Assignment', entityRefIdx: 15 },
    { userIdx: 12, action: 'VERIFY', entity: 'Verification', entityRefIdx: 8 },
    { userIdx: 1, action: 'CREATE', entity: 'Report', entityRefIdx: 1 },
    { userIdx: 2, action: 'CREATE', entity: 'Report', entityRefIdx: 2 },
    { userIdx: 14, action: 'UPDATE', entity: 'Report', entityRefIdx: 8 },
    { userIdx: 19, action: 'ADMIN_REVIEW', entity: 'Agency', entityRefIdx: 4 },
  ];

  for (const log of auditSeed) {
    let entityId = 'n/a';
    if (log.entity === 'Report') entityId = reports[log.entityRefIdx % reports.length].id;
    else if (log.entity === 'Assignment') entityId = assignments[log.entityRefIdx % assignments.length].id;
    else if (log.entity === 'Verification') entityId = verifications[log.entityRefIdx % verifications.length].id;
    else if (log.entity === 'User') entityId = users[log.entityRefIdx % users.length].id;
    else if (log.entity === 'Agency') entityId = agencies[log.entityRefIdx % agencies.length].id;

    await prisma.auditLog.create({
      data: {
        userId: users[log.userIdx].id,
        action: log.action,
        entity: log.entity,
        entityId,
        ipAddress: '192.168.1.' + ((log.userIdx % 200) + 1),
      },
    });
  }

  console.log('Seed complete:');
  console.log(`  users: ${users.length}`);
  console.log(`  agencies: ${agencies.length}`);
  console.log(`  reports: ${reports.length}`);
  console.log(`  verifications: ${verifications.length}`);
  console.log(`  photos: ${photoSeed.length}`);
  console.log(`  assignments: ${assignments.length}`);
  console.log(`  fieldInspections: ${inspectionSeed.length}`);
  console.log(`  statusHistory: ${statusHistorySeed.length}`);
  console.log(`  notifications: ${notificationSeed.length}`);
  console.log(`  auditLogs: ${auditSeed.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });