/**
 * seed.js
 * Populates the database with sample data for testing.
 * Run ONCE with: node seed.js
 *
 * Creates:
 *   - 1 admin account     (admin@campus.ca / admin123)
 *   - 2 student accounts  (student1@campus.ca / student123, etc.)
 *   - 6 campus resources  (rooms, labs, equipment)
 *   - 3 sample bookings
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Resource = require('./models/Resource');
const Booking  = require('./models/Booking');

// ── Sample data ───────────────────────────────────────────────────────────────

const users = [
  {
    name:      'Admin User',
    email:     'admin@campus.ca',
    password:  'admin123',
    role:      'admin',
    studentId: '000000001'
  },
  {
    name:      'Jane Smith',
    email:     'student1@campus.ca',
    password:  'student123',
    role:      'student',
    studentId: '041234567'
  },
  {
    name:      'Marcus Johnson',
    email:     'student2@campus.ca',
    password:  'student123',
    role:      'student',
    studentId: '041234568'
  }
];

const resources = [
  {
    name:        'Boardroom A',
    category:    'room',
    description: 'A fully equipped boardroom with projector, whiteboard, and video conferencing setup. Ideal for group meetings and presentations.',
    capacity:    12,
    location:    'Building C, Room 204',
    isAvailable: true,
    features:    ['Projector', 'Whiteboard', 'Video Conferencing', 'Air Conditioning']
  },
  {
    name:        'Computer Lab B',
    category:    'lab',
    description: 'Windows workstations with full Adobe Creative Suite, MS Office, and development tools installed.',
    capacity:    24,
    location:    'Technology Building, Room 102',
    isAvailable: true,
    features:    ['Windows PCs', 'Adobe Suite', 'Microsoft Office', 'High-Speed Internet']
  },
  {
    name:        'Mac Lab',
    category:    'lab',
    description: 'iMac workstations equipped with Final Cut Pro, Logic Pro, and the full Adobe Creative Cloud suite.',
    capacity:    20,
    location:    'Media Arts Building, Room 301',
    isAvailable: true,
    features:    ['iMac Computers', 'Final Cut Pro', 'Logic Pro', 'Adobe CC']
  },
  {
    name:        'Quiet Study Pod 1',
    category:    'study-space',
    description: 'A private, sound-dampened study pod for focused individual work or small group sessions.',
    capacity:    4,
    location:    'Library, Level 2',
    isAvailable: true,
    features:    ['Sound-Dampened', 'Natural Light', 'Power Outlets', 'Standing Desk']
  },
  {
    name:        'DSLR Camera Kit',
    category:    'equipment',
    description: 'Canon EOS R5 with a selection of lenses, tripod, lighting kit, and carrying case.',
    capacity:    1,
    location:    'Media Resource Desk, Building A',
    isAvailable: true,
    features:    ['Canon EOS R5', '24-70mm Lens', 'Tripod', 'LED Lighting Kit']
  },
  {
    name:        'Seminar Room D',
    category:    'room',
    description: 'A flexible seminar room with movable desks, perfect for workshops and collaborative learning.',
    capacity:    30,
    location:    'Main Building, Room 118',
    isAvailable: false, // Marked offline for demo purposes
    features:    ['Movable Desks', 'Smart Board', 'Whiteboard Wall', 'Air Conditioning']
  }
];

// ── Seed function ─────────────────────────────────────────────────────────────
async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅  Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Resource.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️   Cleared existing data');

    // Create users (passwords are auto-hashed by the pre-save hook)
    const createdUsers = await User.create(users);
    console.log(`👤  Created ${createdUsers.length} users`);

    // Find admin user to assign as resource creator
    const admin = createdUsers.find(u => u.role === 'admin');

    // Create resources
    const resourcesWithCreator = resources.map(r => ({
      ...r,
      createdBy: admin._id
    }));
    const createdResources = await Resource.create(resourcesWithCreator);
    console.log(`🏛️   Created ${createdResources.length} resources`);

    // Create sample bookings
    const student1 = createdUsers.find(u => u.email === 'student1@campus.ca');
    const student2 = createdUsers.find(u => u.email === 'student2@campus.ca');
    const boardroom = createdResources.find(r => r.name === 'Boardroom A');
    const compLab   = createdResources.find(r => r.name === 'Computer Lab B');

    // Tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    // Day after tomorrow
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setUTCHours(0, 0, 0, 0);

    const bookings = [
      {
        user:      student1._id,
        resource:  boardroom._id,
        date:      tomorrow,
        startTime: '10:00',
        endTime:   '12:00',
        purpose:   'Group project presentation practice',
        status:    'confirmed'
      },
      {
        user:      student1._id,
        resource:  compLab._id,
        date:      dayAfter,
        startTime: '14:00',
        endTime:   '16:00',
        purpose:   'Web development assignment',
        status:    'confirmed'
      },
      {
        user:      student2._id,
        resource:  boardroom._id,
        date:      dayAfter,
        startTime: '09:00',
        endTime:   '11:00',
        purpose:   'Team meeting',
        status:    'confirmed'
      }
    ];

    await Booking.create(bookings);
    console.log(`📅  Created ${bookings.length} sample bookings`);

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('\n' + '─'.repeat(50));
    console.log('🎉  Database seeded successfully!\n');
    console.log('📋  Login credentials:');
    console.log('   Admin:    admin@campus.ca     / admin123');
    console.log('   Student1: student1@campus.ca  / student123');
    console.log('   Student2: student2@campus.ca  / student123');
    console.log('─'.repeat(50) + '\n');

    process.exit(0);

  } catch (err) {
    console.error('❌  Seed error:', err);
    process.exit(1);
  }
}

seed();
