import { PrismaClient, OrgRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// 110 Unique Indian First Names
const allFirstNames = "Aarav,Vivaan,Aditya,Vihaan,Arjun,Sai,Reyansh,Ayaan,Krishna,Ishaan,Shaurya,Atharv,Advik,Pranav,Advaith,Aaryan,Dhruv,Kabir,Ritvik,Anirudh,Ananya,Diya,Advika,Saanvi,Aadhya,Myra,Anika,Kiara,Riya,Aarohi,Avni,Mehak,Prisha,Navya,Pari,Angel,Anvi,Ishita,Nitya,Tanvi,Rohan,Karan,Rahul,Amit,Sneha,Priya,Neha,Pooja,Vikram,Sanjay,Rajesh,Anil,Sunil,Manoj,Deepak,Ramesh,Suresh,Mahesh,Ganesh,Ashok,Nair,Shinde,Patil,Deshmukh,Joshi,Kulkarni,Gadgil,Kelkar,Ranade,Shastri,Trivedi,Chaturvedi,Banerjee,Chatterjee,Mukherjee,Das,Bose,Roy,Sen,Gupta,Agarwal,Mittal,Goel,Bansal,Jindal,Singhal,Jain,Shah,Mehta,Parekh,Thakkar,Vyas,Bhatt,Pandey,Mishra,Tiwari,Dubey,Shukla,Tripathi,Yadav,Kumar,Singh,Rathore,Chauhan,Solanki,Parmar,Vaghela,Kapoor,Khanna,Malhotra,Chopra,Bhatia,Sethi,Ahuja".split(',');

const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Desai', 'Joshi', 'Reddy', 'Nair', 'Iyer', 'Mehta', 'Shah', 'Verma', 'Chauhan', 'Rao'];
const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
const skills = ['React', 'Node.js', 'Python', 'Java', 'C++', 'UI/UX', 'Machine Learning', 'Data Science', 'Cloud Computing'];
const interests = ['Coding', 'Robotics', 'Music', 'Dance', 'Photography', 'Public Speaking', 'Sports', 'Gaming'];

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log('???  Clearing old data...');
  await prisma.application.deleteMany();
  await prisma.recruitmentCycle.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.facultyProfile.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  console.log('?? Creating default Admin account...');
  const adminPasswordHash = await argon2.hash('password123');
  await prisma.user.create({
    data: { email: 'admin@campushub.com', passwordHash: adminPasswordHash, globalRole: 'ADMIN', status: 'ACTIVE' }
  });

  console.log('????? Creating 10 Faculty with Name-based credentials...');
  const facultyList = [];
  for (let i = 0; i < 10; i++) {
    const fName = allFirstNames[i];
    const fEmail = `${fName}@campushub.com`;
    const fPassword = `${fName}123`;
    const fHash = await argon2.hash(fPassword);
    
    const u = await prisma.user.create({
      data: {
        email: fEmail, passwordHash: fHash, globalRole: 'FACULTY', status: 'ACTIVE',
        facultyProfile: { create: { firstName: fName, lastName: getRandom(lastNames), designation: 'Assistant Professor', department: getRandom(departments), bio: 'Passionate about teaching and mentoring.' } }
      }
    });
    facultyList.push(u);
    console.log(`   - ${fName}: ${fEmail} / ${fPassword}`);
  }

  console.log('?? Creating 20 Clubs...');
  const categories = ['Technical', 'Cultural', 'Sports', 'Speaking', 'Other'];
  const clubNames = ['Coding Club', 'Robotics Society', 'AI Enthusiasts', 'Web Dev Club', 'Music Club', 'Dance Crew', 'Drama Society', 'Photography Club', 'E-Cell', 'Debate Club', 'MUN Society', 'Sports Club', 'Cricket Team', 'Football Team', 'Basketball Team', 'Design Guild', 'Gaming Community', 'Literary Society', 'Green Club', 'Astronomy Club'];
  
  const clubs = [];
  for (let i = 0; i < 20; i++) {
    const c = await prisma.organization.create({
      data: {
        name: clubNames[i], description: `The official ${clubNames[i]} of the college.`, category: categories[i % categories.length], status: 'ACTIVE'
      }
    });
    clubs.push(c);
  }

  console.log('?? Creating 100 Students with Name-based credentials...');
  for (let i = 0; i < 100; i++) {
    const sName = allFirstNames[i + 10]; // Use names starting from index 10
    const sEmail = `${sName}@campushub.com`;
    const sPassword = `${sName}123`;
    const sHash = await argon2.hash(sPassword);

    const student = await prisma.user.create({
      data: {
        email: sEmail, passwordHash: sHash, globalRole: 'STUDENT', status: 'ACTIVE',
        studentProfile: {
          create: {
            firstName: sName, lastName: getRandom(lastNames), rollNumber: `ROLL-${1000 + i}`, department: getRandom(departments),
            bio: 'Excited to join campus life!', interests: [getRandom(interests), getRandom(interests)], skills: [getRandom(skills), getRandom(skills)], projects: []
          }
        }
      }
    });

    // Randomly assign to 1 to 3 clubs
    const numClubs = Math.floor(Math.random() * 3) + 1;
    const shuffledClubs = [...clubs].sort(() => 0.5 - Math.random()).slice(0, numClubs);
    
    for (let j = 0; j < shuffledClubs.length; j++) {
      let role: OrgRole = 'MEMBER';
      if (i < 20 && j === 0) role = 'CLUB_HEAD';
      else if (i < 40 && j === 0) role = 'COMMITTEE_MEMBER';

      await prisma.membership.create({
        data: { userId: student.id, organizationId: shuffledClubs[j].id, role }
      });
    }
  }

  // Just logging a few examples so the user knows how to test
  console.log(`   - Example Student: ${allFirstNames[10]}@campushub.com / ${allFirstNames[10]}123`);
  console.log(`   - Example Student: ${allFirstNames[50]}@campushub.com / ${allFirstNames[50]}123`);

  console.log('?? Creating Events, Recruitment Cycles, and Opportunities...');
  for (let i = 0; i < 15; i++) {
    const club = clubs[i % clubs.length];
    await prisma.event.create({
      data: { title: `${club.name} Annual Meetup`, description: `Join us for the annual gathering of ${club.name}.`, startDate: new Date(Date.now() + 86400000 * 5), endDate: new Date(Date.now() + 86400000 * 6), organizationId: club.id, status: 'PUBLISHED', isFest: i % 3 === 0 }
    });
  }
  for (let i = 0; i < 10; i++) {
    const club = clubs[i % clubs.length];
    await prisma.recruitmentCycle.create({
      data: { title: `${club.name} Core Team Recruitment`, description: `We are looking for passionate individuals!`, deadline: new Date(Date.now() + 86400000 * 10), organizationId: club.id, status: 'OPEN' }
    });
  }
  for (let i = 0; i < 10; i++) {
    await prisma.opportunity.create({
      data: { title: `National ${['Hackathon', 'Workshop', 'Conference', 'Competition'][i % 4]} 2026`, description: `Showcase your skills at the national level.`, category: ['Hackathon', 'Workshop', 'Conference', 'Competition'][i % 4], deadline: new Date(Date.now() + 86400000 * 15), status: 'PUBLISHED', publisherId: facultyList[0].id }
    });
  }

  console.log('? Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
