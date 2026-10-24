import { PrismaClient, OrgRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const allFirstNames = "Aarav,Vivaan,Aditya,Vihaan,Arjun,Sai,Reyansh,Ayaan,Krishna,Ishaan,Shaurya,Atharv,Advik,Pranav,Advaith,Aaryan,Dhruv,Kabir,Ritvik,Anirudh,Ananya,Diya,Advika,Saanvi,Aadhya,Myra,Anika,Kiara,Riya,Aarohi,Avni,Mehak,Prisha,Navya,Pari,Angel,Anvi,Ishita,Nitya,Tanvi,Rohan,Karan,Rahul,Amit,Sneha,Priya,Neha,Pooja,Vikram,Sanjay,Rajesh,Anil,Sunil,Manoj,Deepak,Ramesh,Suresh,Mahesh,Ganesh,Ashok,Nair,Shinde,Patil,Deshmukh,Joshi,Kulkarni,Gadgil,Kelkar,Ranade,Shastri,Trivedi,Chaturvedi,Banerjee,Chatterjee,Mukherjee,Das,Bose,Roy,Sen,Gupta,Agarwal,Mittal,Goel,Bansal,Jindal,Singhal,Jain,Shah,Mehta,Parekh,Thakkar,Vyas,Bhatt,Pandey,Mishra,Tiwari,Dubey,Shukla,Tripathi,Yadav,Kumar,Singh,Rathore,Chauhan,Solanki,Parmar,Vaghela,Kapoor,Khanna,Malhotra,Chopra,Bhatia,Sethi,Ahuja".split(',');

const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Desai', 'Joshi', 'Reddy', 'Nair', 'Iyer', 'Mehta', 'Shah', 'Verma', 'Chauhan', 'Rao'];
const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
const skills = ['React', 'Node.js', 'Python', 'Java', 'C++', 'UI/UX', 'Machine Learning', 'Data Science', 'Cloud Computing'];
const interests = ['Coding', 'Robotics', 'Music', 'Dance', 'Photography', 'Public Speaking', 'Sports', 'Gaming'];

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const futureDate = (days: number) => new Date(Date.now() + days * 86400000);

const clubsData = [
  { name: 'Coding Club', category: 'Technical', description: 'The premier competitive programming and software development community at VIT Pune. We host weekly DSA sessions, monthly hackathons, and prepare students for placements at top tech companies. Our alumni work at Google, Microsoft, and Amazon.' },
  { name: 'Robotics Society', category: 'Technical', description: 'Build intelligent machines, participate in national robotics competitions, and learn ROS, Arduino, and autonomous systems. We compete in ROBOCON and ABU Robocon annually.' },
  { name: 'AI Enthusiasts', category: 'Technical', description: 'Exploring the frontiers of Machine Learning, Deep Learning, and Generative AI. Weekly paper-reading sessions, Kaggle competitions, and hands-on projects with TensorFlow and PyTorch.' },
  { name: 'Web Dev Club', category: 'Technical', description: 'Full-stack web development enthusiasts building production-grade applications. Learn MERN stack, Next.js, cloud deployment, and DevOps practices through real projects.' },
  { name: 'Design Guild', category: 'Cultural', description: 'UI/UX designers, graphic artists, and creative thinkers. We conduct Figma workshops, design sprints, and brand identity projects for other campus clubs.' },
  { name: 'Music Club', category: 'Cultural', description: 'The heartbeat of VIT Pune. From classical to rock, our musicians perform at college fests, inter-college competitions, and open-mic nights.' },
  { name: 'Dance Crew', category: 'Cultural', description: 'Award-winning dance troupe specializing in hip-hop, contemporary, Bollywood, and classical forms. Winners of Pune University Dance Championship 2025.' },
  { name: 'Drama Society', category: 'Cultural', description: 'VIT\'s oldest theatre group. We perform street plays, English dramas, and Marathi nataks exploring social themes and contemporary issues.' },
  { name: 'Photography Club', category: 'Cultural', description: 'Capturing moments, telling stories. Weekly photo walks, editing workshops in Lightroom & Photoshop, and annual exhibitions showcasing student work.' },
  { name: 'Literary Society', category: 'Speaking', description: 'Writers, poets, and literature enthusiasts. We host poetry slams, creative writing workshops, and publish the annual campus magazine \'Kalam\'.' },
  { name: 'Debate Club', category: 'Speaking', description: 'Sharpening critical thinking and public speaking skills. Regular parliamentary debates, extempore sessions, and participation in national debate tournaments.' },
  { name: 'MUN Society', category: 'Speaking', description: 'Model United Nations enthusiasts simulating global diplomacy. Annual VITMUN conference with 500+ delegates from across India.' },
  { name: 'E-Cell', category: 'Other', description: 'Entrepreneurship Cell nurturing the next generation of founders. We organize pitch competitions, startup bootcamps, and connect students with VCs and angel investors.' },
  { name: 'Gaming Community', category: 'Other', description: 'Home to esports athletes and casual gamers. Regular BGMI, Valorant, and FIFA tournaments. Our teams compete in national esports leagues.' },
  { name: 'Astronomy Club', category: 'Other', description: 'Stargazing sessions, astrophotography, and space science discussions. We organize trips to observatories and telescope-building workshops.' },
  { name: 'Green Club', category: 'Other', description: 'Environmental sustainability advocates. Tree plantation drives, plastic-free campus initiatives, and awareness campaigns on climate change.' },
  { name: 'Sports Club', category: 'Sports', description: 'The umbrella body for all athletic activities at VIT Pune. Organizes the annual inter-departmental sports meet and manages training for university-level teams.' },
  { name: 'Cricket Team', category: 'Sports', description: 'Official VIT Pune cricket team. Regular practice sessions, friendly matches with other Pune colleges, and participation in the Savitribai Phule Pune University league.' },
  { name: 'Football Team', category: 'Sports', description: 'Passionate footballers representing VIT Pune. The team trains 4 days a week and competes in the Pune University Football Tournament.' },
  { name: 'Basketball Team', category: 'Sports', description: 'Men\'s and women\'s basketball teams with a legacy of winning inter-college championships. Open tryouts held every August.' },
];

const eventTemplates: { [key: string]: { title: string; description: string; venue: string; daysOffset: number; isFest?: boolean; capacity?: number }[] } = {
  'Coding Club': [
    { title: 'CodeStorm 2026 - 24 Hour Hackathon', description: 'The flagship 24-hour coding marathon. Build innovative solutions for real-world problems in teams of up to 4. Prizes worth ₹1,00,000. Food, swag, and mentorship from industry experts. Open to all branches and years.', venue: 'CS Lab Complex, Block A', daysOffset: 15, capacity: 100 },
    { title: 'Weekly DSA Bootcamp - Week 12', description: 'Master Dynamic Programming and Graph Algorithms. This week covers Tree DP, Bitmask DP, and Advanced Graph traversals. Bring your laptops and be ready to solve 10 problems live.', venue: 'Lecture Hall 201', daysOffset: 3, capacity: 60 },
  ],
  'Robotics Society': [
    { title: 'ROBOCON 2026 Preview Night', description: 'Watch our flagship robotics team demonstrate the 2026 competition bot. Learn about the design process, mechanical assembly, and programming challenges. Q&A with team leads.', venue: 'Robotics Workshop, Block D', daysOffset: 10, capacity: 80 },
    { title: 'Arduino Workshop for Beginners', description: 'Hands-on workshop covering Arduino basics, sensors, and motor control. All materials provided. Build your first autonomous bot by the end of the day!', venue: 'Innovation Lab', daysOffset: 7, capacity: 40 },
  ],
  'AI Enthusiasts': [
    { title: 'Generative AI Summit 2026', description: 'A full-day summit featuring talks from AI researchers at IITs and leading startups. Topics include LLMs, Diffusion Models, and RAG systems. Networking lunch included.', venue: 'Auditorium, Main Building', daysOffset: 20, capacity: 200 },
    { title: 'Kaggle Competition Kickoff', description: 'Join our internal Kaggle competition on student performance prediction. Learn how to structure ML projects, feature engineering, and model evaluation.', venue: 'CS Lab 3', daysOffset: 5, capacity: 50 },
  ],
  'Web Dev Club': [
    { title: 'Hack the Web - 36 Hour Challenge', description: 'Build and deploy a full-stack application in 36 hours. Judged on UI/UX, functionality, and code quality. Beginner-friendly tracks available.', venue: 'IT Lab Complex', daysOffset: 25, capacity: 80 },
    { title: 'Next.js & tRPC Masterclass', description: 'Learn to build type-safe, production-grade React apps using Next.js 14, tRPC, and Prisma. Bring your laptop with Node.js installed.', venue: 'IT Seminar Hall', daysOffset: 8, capacity: 45 },
  ],
  'Design Guild': [
    { title: 'UI/UX Bootcamp with Figma', description: 'From wireframes to high-fidelity prototypes. Learn design thinking, color theory, and component libraries. Portfolio-ready project at the end.', venue: 'Design Studio', daysOffset: 6, capacity: 30 },
    { title: 'Brand Identity Design Competition', description: 'Design a complete brand identity for a fictional startup. Deliverables include logo, color palette, typography, and a brand guideline PDF. Judged by industry designers.', venue: 'Online', daysOffset: 18, capacity: 100 },
  ],
  'Music Club': [
    { title: 'Raag 2026 - Annual Music Night', description: 'VIT Pune\'s biggest musical evening. Featuring classical, semi-classical, Bollywood, and fusion performances by our talented members. Guest performance by a surprise artist!', venue: 'Open Air Theatre', daysOffset: 30, capacity: 500 },
    { title: 'Open Mic - Unplugged Session', description: 'Bring your guitar, ukulele, or just your voice. A cozy evening of acoustic performances under the stars. Sign up sheet open till the day before.', venue: 'Cafeteria Garden', daysOffset: 4, capacity: 100 },
  ],
  'Dance Crew': [
    { title: 'Footwork 2026 - Dance Competition', description: 'Inter-college dance competition featuring 20+ teams from Pune. Categories: Hip-Hop, Contemporary, Bollywood, and Classical. Total prize pool of ₹75,000.', venue: 'Auditorium, Main Building', daysOffset: 40, capacity: 300, isFest: true },
    { title: 'Hip-Hop Choreography Workshop', description: 'Learn the fundamentals of hip-hop dance from our senior choreographers. Open to beginners and intermediate dancers. Wear comfortable clothes.', venue: 'Dance Room, Block B', daysOffset: 5, capacity: 40 },
  ],
  'Drama Society': [
    { title: 'Rangmanch - Annual Theatre Festival', description: 'A three-day theatre festival featuring 10+ plays in English, Hindi, and Marathi. Street plays, experimental theatre, and a special alumni performance.', venue: 'Auditorium, Main Building', daysOffset: 50, capacity: 400, isFest: true },
    { title: 'Street Play - Say No to Plastic', description: 'Our street play team performs an awareness skit on plastic pollution. Open air, open to all. A 20-minute powerful performance.', venue: 'Main Gate Amphitheatre', daysOffset: 2, capacity: 500 },
  ],
  'Photography Club': [
    { title: 'Sunrise Photo Walk at Sinhagad', description: 'An early morning trek to Sinhagad Fort for landscape photography. Learn composition, lighting, and how to shoot in golden hour. Transport arranged.', venue: 'Sinhagad Fort (Meet at Main Gate)', daysOffset: 12, capacity: 25 },
    { title: 'Lightroom Editing Masterclass', description: 'Learn professional photo editing in Adobe Lightroom. Color grading, masking, retouching, and exporting for social media. Bring your laptop.', venue: 'Computer Lab 5', daysOffset: 9, capacity: 35 },
  ],
  'Literary Society': [
    { title: 'Kalam 2026 - Annual Literary Festival', description: 'Two-day festival with poetry slams, story writing contests, author sessions, and book launches. Renowned Marathi and English authors as guests.', venue: 'Library Complex', daysOffset: 45, capacity: 200, isFest: true },
    { title: 'Open Mic Poetry Night', description: 'Spoken word poetry event. Come share your original work or just listen. Warm, supportive atmosphere. Snacks provided.', venue: 'Cafeteria', daysOffset: 3, capacity: 80 },
  ],
  'Debate Club': [
    { title: 'Parliamentary Debate Championship', description: 'A 2-day British Parliamentary format debate competition. Open to all years. Cash prizes, certificates, and trophies. Judged by national-level debaters.', venue: 'Seminar Hall 1', daysOffset: 22, capacity: 60 },
    { title: 'Extempore Speaking Session', description: 'Practice your quick thinking and public speaking. Random topics, 3-minute speeches, and constructive feedback from seniors.', venue: 'Room 304', daysOffset: 1, capacity: 30 },
  ],
  'MUN Society': [
    { title: 'VITMUN 2026 - Model United Nations', description: 'VIT Pune\'s flagship MUN conference with 500+ delegates from across India. 8 committees including UNSC, UNGA, and Lok Sabha simulation. Guest lecture by ex-diplomats.', venue: 'Main Academic Block', daysOffset: 60, capacity: 500, isFest: true },
    { title: 'MUN Training Workshop', description: 'For first-time MUN participants. Learn rules of procedure, how to research country policies, and tips for effective diplomacy and public speaking.', venue: 'Room 401', daysOffset: 10, capacity: 50 },
  ],
  'E-Cell': [
    { title: 'Startup Pitch Day 2026', description: 'Pitch your startup idea to a panel of VCs and angel investors. Winning teams receive seed funding and incubation support. Open to students with a working prototype.', venue: 'Auditorium, Main Building', daysOffset: 35, capacity: 150 },
    { title: 'Founder Fireside Chat', description: 'Intimate conversation with the founder of a Pune-based unicorn startup. Discuss the journey, challenges, and scaling strategies. Q&A included.', venue: 'Seminar Hall 2', daysOffset: 14, capacity: 100 },
  ],
  'Gaming Community': [
    { title: 'BGMI Tournament - Season 6', description: 'Squad-based BGMI tournament. Prize pool ₹30,000. Open qualifiers, then finals. Bring your phones and headphones. LAN for finals.', venue: 'Gaming Lounge', daysOffset: 16, capacity: 64 },
    { title: 'Valorant LAN Party', description: '5v5 Valorant tournament on our high-end gaming PCs. Streamed live on our YouTube channel. Winners get gaming peripherals and merch.', venue: 'Gaming Lounge', daysOffset: 28, capacity: 40 },
  ],
  'Astronomy Club': [
    { title: 'Stargazing Night at Taljai Hills', description: 'Observe Jupiter, Saturn, and deep-sky objects through our 8-inch Dobsonian telescope. Learn to identify constellations. Bring warm clothes.', venue: 'Taljai Hills (Meet at Campus Gate)', daysOffset: 11, capacity: 30 },
    { title: 'Astrophotography Workshop', description: 'Learn to capture stunning images of the Moon, Milky Way, and nebulae using DSLR cameras and smartphone adapters. Post-processing included.', venue: 'Rooftop, Block C', daysOffset: 19, capacity: 20 },
  ],
  'Green Club': [
    { title: 'Van Mahotsav - Tree Plantation Drive', description: 'Plant 500 saplings across the campus and nearby areas. Join hands with the Pune Municipal Corporation. Refreshments provided.', venue: 'Campus Garden Areas', daysOffset: 8, capacity: 200 },
    { title: 'Zero Waste Campus Awareness', description: 'A week-long campaign on waste segregation, composting, and plastic reduction. Guest speaker from an environmental NGO.', venue: 'Main Building Lobby', daysOffset: 13, capacity: 150 },
  ],
  'Sports Club': [
    { title: 'Annual Sports Meet 2026', description: '5-day inter-departmental sports meet featuring 15+ sports including cricket, football, basketball, athletics, badminton, and table tennis. All students welcome.', venue: 'Sports Ground', daysOffset: 55, capacity: 800, isFest: true },
    { title: 'Fitness Challenge - 30 Days', description: 'Take a 30-day fitness challenge with daily workout plans and progress tracking. Open to all fitness levels. Winners get gym memberships.', venue: 'Gymnasium, Sports Complex', daysOffset: 1, capacity: 300 },
  ],
  'Cricket Team': [
    { title: 'Practice Match vs. COEP Pune', description: 'Friendly T20 match against COEP\'s cricket team. Come support our team. Free entry. Snacks available.', venue: 'Main Cricket Ground', daysOffset: 6, capacity: 200 },
    { title: 'Inter-College T20 Tournament', description: 'We are hosting 8 colleges from Pune for a T20 knockout tournament. Finals to be played under floodlights.', venue: 'Main Cricket Ground', daysOffset: 32, capacity: 500, isFest: true },
  ],
  'Football Team': [
    { title: 'Friendly Match vs. Symbiosis Pune', description: '11v11 friendly football match. Supporters welcome. Let\'s pack the stands and show our college spirit.', venue: 'Football Ground', daysOffset: 7, capacity: 300 },
    { title: 'Pune University Football League', description: 'Our team competes in the SPPU football league. First home match of the season. Come cheer us on!', venue: 'Football Ground', daysOffset: 21, capacity: 400 },
  ],
  'Basketball Team': [
    { title: 'Inter-College Basketball Championship', description: '8-team knockout basketball championship. Both men\'s and women\'s categories. Prize money and certificates.', venue: 'Basketball Court', daysOffset: 24, capacity: 200 },
    { title: 'Open Tryouts for New Season', description: 'Looking for fresh talent! Open tryouts for both men\'s and women\'s basketball teams. Wear sports shoes. Bring water bottle.', venue: 'Basketball Court', daysOffset: 4, capacity: 60 },
  ],
};

async function main() {
  console.log('🗑️  Clearing old data...');
  await prisma.application.deleteMany();
  await prisma.recruitmentCycle.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.facultyProfile.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.exchangeItem.deleteMany();
  await prisma.message.deleteMany();
  await prisma.user.deleteMany();

  console.log('🔐 Creating default Admin account...');
  const adminPasswordHash = await argon2.hash('password123');
  await prisma.user.create({
    data: { email: 'admin@campushub.com', passwordHash: adminPasswordHash, globalRole: 'ADMIN', status: 'ACTIVE' }
  });

  console.log('👨‍🏫 Creating 10 Faculty...');
  const facultyList = [];
  for (let i = 0; i < 10; i++) {
    const fName = allFirstNames[i];
    const fHash = await argon2.hash(`${fName}123`);
    const u = await prisma.user.create({
      data: {
        email: `${fName}@campushub.com`, passwordHash: fHash, globalRole: 'FACULTY', status: 'ACTIVE',
        facultyProfile: { create: { firstName: fName, lastName: getRandom(lastNames), designation: 'Assistant Professor', department: getRandom(departments), bio: 'Passionate about teaching, research, and mentoring student organizations.' } }
      }
    });
    facultyList.push(u);
  }

  console.log('🏢 Creating 20 Clubs with detailed descriptions...');
  const clubs = [];
  for (const clubData of clubsData) {
    const renewalDate = new Date();
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    const c = await prisma.organization.create({
      data: {
        name: clubData.name,
        description: clubData.description,
        category: clubData.category,
        status: 'ACTIVE',
        renewalDate: renewalDate,
      }
    });
    clubs.push(c);
  }

  console.log('🎓 Creating 100 Students...');
  for (let i = 0; i < 100; i++) {
    const sName = allFirstNames[i + 10];
    const sHash = await argon2.hash(`${sName}123`);
    const student = await prisma.user.create({
      data: {
        email: `${sName}@campushub.com`, passwordHash: sHash, globalRole: 'STUDENT', status: 'ACTIVE',
        studentProfile: {
          create: {
            firstName: sName, lastName: getRandom(lastNames), rollNumber: `ROLL-${1000 + i}`,
            department: getRandom(departments),
            bio: `Passionate ${getRandom(departments)} student at VIT Pune. Love ${getRandom(interests)} in my free time.`,
            interests: [getRandom(interests), getRandom(interests)],
            skills: [getRandom(skills), getRandom(skills)],
            projects: []
          }
        }
      }
    });

    // Assign to 1-3 clubs
    const numClubs = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...clubs].sort(() => 0.5 - Math.random()).slice(0, numClubs);
    for (let j = 0; j < shuffled.length; j++) {
      let role: OrgRole = 'MEMBER';
      if (i < 20 && j === 0) role = 'CLUB_HEAD';
      else if (i < 40 && j === 0) role = 'COMMITTEE_MEMBER';
      await prisma.membership.create({
        data: { userId: student.id, organizationId: shuffled[j].id, role }
      });
    }
  }

  console.log('📅 Creating detailed Events...');
  for (const club of clubs) {
    const templates = eventTemplates[club.name];
    if (!templates) continue;
    for (const t of templates) {
      await prisma.event.create({
        data: {
          title: t.title,
          description: t.description,
          venue: t.venue,
          startDate: futureDate(t.daysOffset),
          endDate: futureDate(t.daysOffset + 1),
          organizationId: club.id,
          status: 'PUBLISHED',
          isFest: t.isFest || false,
          maxCapacity: t.capacity || null,
        }
      });
    }
  }

  console.log('📢 Creating Recruitment Cycles...');
  for (let i = 0; i < 10; i++) {
    const club = clubs[i];
    await prisma.recruitmentCycle.create({
      data: {
        title: `${club.name} - Core Team Recruitment 2026`,
        description: `We are hiring passionate students for core team positions (Technical, Design, Marketing, Events). Bring your A-game and be part of an amazing journey!`,
        deadline: futureDate(20),
        organizationId: club.id,
        status: 'OPEN'
      }
    });
  }

  console.log('🚀 Creating External Opportunities...');
  const oppsData = [
    { title: 'Smart India Hackathon 2026', category: 'Hackathon', description: 'The world\'s largest open innovation model. Solve real-world problem statements from ministries and top companies. Grand finale in New Delhi with ₹1 Lakh prize.', days: 30 },
    { title: 'Google Summer of Code 2026', category: 'Workshop', description: 'Work with open-source organizations for 12 weeks. Stipend of $3000. Mentorship from top developers worldwide. Applications open now.', days: 45 },
    { title: 'Microsoft Imagine Cup 2026', category: 'Competition', description: 'Global student technology competition. Build innovative solutions with Azure AI. Winners get $100,000 and Microsoft mentorship.', days: 60 },
    { title: 'IEEE Tech Symposium', category: 'Conference', description: 'Two-day conference on emerging technologies. Keynote speakers from industry. Paper presentation opportunities for UG students.', days: 25 },
    { title: 'Amazon ML Summer School', category: 'Workshop', description: 'Free 6-week online ML program by Amazon scientists. Certificate on completion. Excellent for placement preparation.', days: 15 },
  ];
  for (const o of oppsData) {
    await prisma.opportunity.create({
      data: {
        title: o.title,
        description: o.description,
        category: o.category,
        deadline: futureDate(o.days),
        status: 'PUBLISHED',
        publisherId: facultyList[0].id
      }
    });
  }

  console.log('✅ Seeding complete! Rich data ready.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });