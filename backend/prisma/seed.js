const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const predefinedSkills = [
  // Programming & Technology
  { name: 'JavaScript', category: 'Programming' },
  { name: 'Python', category: 'Programming' },
  { name: 'React', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'SQL', category: 'Database' },
  { name: 'Git', category: 'Version Control' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'AWS', category: 'Cloud Computing' },
  
  // Languages
  { name: 'English', category: 'Language' },
  { name: 'Spanish', category: 'Language' },
  { name: 'French', category: 'Language' },
  { name: 'German', category: 'Language' },
  { name: 'Mandarin', category: 'Language' },
  { name: 'Japanese', category: 'Language' },
  
  // Creative Skills
  { name: 'Photography', category: 'Creative' },
  { name: 'Graphic Design', category: 'Creative' },
  { name: 'Video Editing', category: 'Creative' },
  { name: 'Drawing', category: 'Creative' },
  { name: 'Music Production', category: 'Creative' },
  { name: 'Writing', category: 'Creative' },
  
  // Business & Professional
  { name: 'Project Management', category: 'Business' },
  { name: 'Marketing', category: 'Business' },
  { name: 'Sales', category: 'Business' },
  { name: 'Data Analysis', category: 'Business' },
  { name: 'Excel', category: 'Business' },
  { name: 'PowerPoint', category: 'Business' },
  
  // Life Skills
  { name: 'Cooking', category: 'Life Skills' },
  { name: 'Gardening', category: 'Life Skills' },
  { name: 'Fitness Training', category: 'Life Skills' },
  { name: 'Meditation', category: 'Life Skills' },
  { name: 'Public Speaking', category: 'Life Skills' },
  { name: 'Time Management', category: 'Life Skills' },
  
  // Academic
  { name: 'Mathematics', category: 'Academic' },
  { name: 'Physics', category: 'Academic' },
  { name: 'Chemistry', category: 'Academic' },
  { name: 'Biology', category: 'Academic' },
  { name: 'History', category: 'Academic' },
  { name: 'Literature', category: 'Academic' }
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.feedback.deleteMany();
  await prisma.swapRequest.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.userAvailability.deleteMany();
  await prisma.user.deleteMany();
  await prisma.skill.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create predefined skills
  const createdSkills = [];
  for (const skill of predefinedSkills) {
    const createdSkill = await prisma.skill.create({
      data: skill
    });
    createdSkills.push(createdSkill);
  }
  console.log(`✅ Created ${createdSkills.length} predefined skills`);

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const users = [
    {
      email: 'john.doe@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      location: 'New York, NY',
      bio: 'Full-stack developer passionate about teaching and learning new technologies.',
      profileVisibility: 'PUBLIC',
      isAvailable: true
    },
    {
      email: 'jane.smith@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      location: 'San Francisco, CA',
      bio: 'UX designer and photography enthusiast. Always eager to learn new creative skills.',
      profileVisibility: 'PUBLIC',
      isAvailable: true
    },
    {
      email: 'mike.wilson@example.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Wilson',
      location: 'Austin, TX',
      bio: 'Data scientist who loves cooking and fitness. Looking to improve my Spanish skills.',
      profileVisibility: 'PUBLIC',
      isAvailable: true
    }
  ];

  const createdUsers = [];
  for (const user of users) {
    const createdUser = await prisma.user.create({
      data: user
    });
    createdUsers.push(createdUser);
  }
  console.log(`✅ Created ${createdUsers.length} sample users`);

  // Add skills to users
  const userSkills = [
    // John Doe - offers programming, wants creative skills
    { userId: createdUsers[0].id, skillId: createdSkills.find(s => s.name === 'JavaScript').id, skillType: 'OFFERED', level: 4 },
    { userId: createdUsers[0].id, skillId: createdSkills.find(s => s.name === 'React').id, skillType: 'OFFERED', level: 4 },
    { userId: createdUsers[0].id, skillId: createdSkills.find(s => s.name === 'Node.js').id, skillType: 'OFFERED', level: 3 },
    { userId: createdUsers[0].id, skillId: createdSkills.find(s => s.name === 'Photography').id, skillType: 'WANTED', level: 1 },
    { userId: createdUsers[0].id, skillId: createdSkills.find(s => s.name === 'Spanish').id, skillType: 'WANTED', level: 2 },

    // Jane Smith - offers creative skills, wants programming
    { userId: createdUsers[1].id, skillId: createdSkills.find(s => s.name === 'Graphic Design').id, skillType: 'OFFERED', level: 5 },
    { userId: createdUsers[1].id, skillId: createdSkills.find(s => s.name === 'Photography').id, skillType: 'OFFERED', level: 4 },
    { userId: createdUsers[1].id, skillId: createdSkills.find(s => s.name === 'JavaScript').id, skillType: 'WANTED', level: 1 },
    { userId: createdUsers[1].id, skillId: createdSkills.find(s => s.name === 'Python').id, skillType: 'WANTED', level: 2 },

    // Mike Wilson - offers data skills, wants cooking
    { userId: createdUsers[2].id, skillId: createdSkills.find(s => s.name === 'Data Analysis').id, skillType: 'OFFERED', level: 4 },
    { userId: createdUsers[2].id, skillId: createdSkills.find(s => s.name === 'Python').id, skillType: 'OFFERED', level: 4 },
    { userId: createdUsers[2].id, skillId: createdSkills.find(s => s.name === 'Cooking').id, skillType: 'WANTED', level: 1 },
    { userId: createdUsers[2].id, skillId: createdSkills.find(s => s.name === 'Spanish').id, skillType: 'WANTED', level: 1 }
  ];

  for (const userSkill of userSkills) {
    await prisma.userSkill.create({
      data: userSkill
    });
  }
  console.log(`✅ Added ${userSkills.length} user skills`);

  // Add availability for users
  const availabilities = [
    {
      userId: createdUsers[0].id,
      availabilityType: 'EVENINGS',
      startTime: '18:00',
      endTime: '21:00',
      daysOfWeek: ['monday', 'wednesday', 'friday']
    },
    {
      userId: createdUsers[1].id,
      availabilityType: 'WEEKENDS',
      startTime: '10:00',
      endTime: '16:00',
      daysOfWeek: ['saturday', 'sunday']
    },
    {
      userId: createdUsers[2].id,
      availabilityType: 'FLEXIBLE',
      startTime: '09:00',
      endTime: '17:00',
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  ];

  for (const availability of availabilities) {
    await prisma.userAvailability.create({
      data: availability
    });
  }
  console.log(`✅ Added ${availabilities.length} user availabilities`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 