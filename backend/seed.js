/**
 * backend/seed.js
 * Populate the database with sample data for testing.
 * Run once from the backend/ folder: node seed.js
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User     = require('./models/User');
const Resource = require('./models/Resource');
const Booking  = require('./models/Booking');

const users = [
  { name: 'Admin User',    email: 'admin@campus.ca',    password: 'admin123',    role: 'admin',   studentId: '000000001' },
  { name: 'Jane Smith',    email: 'student1@campus.ca', password: 'student123',  role: 'student', studentId: '041234567' },
  { name: 'Marcus Johnson',email: 'student2@campus.ca', password: 'student123',  role: 'student', studentId: '041234568' }
];

const resources = [
  {
    name: 'Boardroom A', category: 'room',
    description: 'Fully equipped boardroom with projector and video conferencing.',
    capacity: 12, location: 'Building C, Room 204', isAvailable: true,
    features: ['Projector', 'Whiteboard', 'Video Conferencing', 'Air Conditioning']
  },
  {
    name: 'Computer Lab B', category: 'lab',
    description: 'Windows workstations with Adobe Creative Suite and dev tools.',
    capacity: 24, location: 'Technology Building, Room 102', isAvailable: true,
    features: ['Windows PCs', 'Adobe Suite', 'Microsoft Office', 'High-Speed Internet']
  },
  {
    name: 'Mac Lab', category: 'lab',
    description: 'iMac workstations with Final Cut Pro and Adobe Creative Cloud.',
    capacity: 20, location: 'Media Arts Building, Room 301', isAvailable: true,
    features: ['iMac Computers', 'Final Cut Pro', 'Logic Pro', 'Adobe CC']
  },
  {
    name: 'Quiet Study Pod 1', category: 'study-space',
    description: 'Sound-dampened private pod for focused work.',
    capacity: 4, location: 'Library, Level 2', isAvailable: true,
    features: ['Sound-Dampened', 'Natural Light', 'Power Outlets', 'Standing Desk']
  },
  {
    name: 'DSLR Camera Kit', category: 'equipment',
    description: 'Canon EOS R5 with lenses, tripod, and lighting kit.',
    capacity: 1, location: 'Media Resource Desk, Building A', isAvailable: true,
    features: ['Canon EOS R5', '24-70mm Lens', 'Tripod', 'LED Lighting Kit']
  },
  {
    name: 'Seminar Room D', category: 'room',
    description: 'Flexible seminar room with movable desks and smart board.',
    capacity: 30, location: 'Main Building, Room 118', isAvailable: false,
    features: ['Movable Desks', 'Smart Board', 'Whiteboard Wall']
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅  Connected to MongoDB');

    await User.deleteMany({});
    await Resource.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️   Cleared existing data');

    const createdUsers     = await User.create(users);
    const admin            = createdUsers.find(u => u.role === 'admin');
    const createdResources = await Resource.create(resources.map(r => ({ ...r, createdBy: admin._id })));

    console.log(`👤  Created ${createdUsers.length} users`);
    console.log(`🏛️   Created ${createdResources.length} resources`);

    const student1  = createdUsers.find(u => u.email === 'student1@campus.ca');
    const student2  = createdUsers.find(u => u.email === 'student2@campus.ca');
    const boardroom = createdResources.find(r => r.name === 'Boardroom A');
    const compLab   = createdResources.find(r => r.name === 'Computer Lab B');

    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setUTCHours(0,0,0,0);
    const dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 2); dayAfter.setUTCHours(0,0,0,0);

    await Booking.create([
      { user: student1._id, resource: boardroom._id, date: tomorrow, startTime: '10:00', endTime: '12:00', purpose: 'Group project presentation', status: 'confirmed' },
      { user: student1._id, resource: compLab._id,   date: dayAfter, startTime: '14:00', endTime: '16:00', purpose: 'Web development assignment',  status: 'confirmed' },
      { user: student2._id, resource: boardroom._id, date: dayAfter, startTime: '09:00', endTime: '11:00', purpose: 'Team meeting',                 status: 'confirmed' }
    ]);
    console.log('📅  Created 3 sample bookings');

    console.log('\n' + '─'.repeat(50));
    console.log('🎉  Seeded successfully!\n');
    console.log('   Admin:    admin@campus.ca    / admin123');
    console.log('   Student1: student1@campus.ca / student123');
    console.log('   Student2: student2@campus.ca / student123');
    console.log('─'.repeat(50));
    process.exit(0);
  } catch (err) {
    console.error('❌  Seed error:', err);
    process.exit(1);
  }
}

seed();
