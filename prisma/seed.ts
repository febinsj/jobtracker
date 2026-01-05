import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a test user with hashed password
  const hashedPassword = await hash("demo123456", 12);
  
  const user = await prisma.user.upsert({
    where: { email: "demo@jobtracker.com" },
    update: {},
    create: {
      email: "demo@jobtracker.com",
      password: hashedPassword,
      firstName: "Demo",
      lastName: "User",
    },
  });

  console.log("✅ Created user:", user.email);

  // Sample job descriptions
  const sampleJobs = [
    {
      company: "Google",
      title: "Senior Software Engineer",
      location: "Mountain View, CA",
      jobLink: "https://careers.google.com/jobs/123",
      salaryMin: 150000,
      salaryMax: 250000,
      source: "LinkedIn",
      interest: 9,
      description: `We're looking for a Senior Software Engineer to join our Cloud Platform team. You'll work on building scalable infrastructure that powers millions of applications worldwide.

Requirements:
- 5+ years of software engineering experience
- Strong proficiency in Go, Java, or C++
- Experience with distributed systems and microservices
- Knowledge of Kubernetes and container orchestration
- BS/MS in Computer Science or equivalent

Responsibilities:
- Design and implement large-scale distributed systems
- Collaborate with cross-functional teams
- Mentor junior engineers
- Participate in code reviews and technical discussions

Benefits:
- Competitive salary and equity
- Health, dental, and vision insurance
- 401(k) matching
- Unlimited PTO
- On-site gym and meals`,
      notes: "Reached out to recruiter on LinkedIn. Have referral from John.",
      status: "APPLIED",
      dateApplied: new Date("2026-01-02"),
      nextFollowupAt: new Date("2026-01-10"),
    },
    {
      company: "Meta",
      title: "Frontend Engineer",
      location: "Menlo Park, CA",
      jobLink: "https://www.metacareers.com/jobs/456",
      salaryMin: 140000,
      salaryMax: 220000,
      source: "Company Website",
      interest: 8,
      description: `Join Meta's Product Infrastructure team to build the next generation of web applications used by billions of people.

What You'll Do:
- Build responsive, performant web applications using React
- Collaborate with designers and product managers
- Optimize application performance
- Write clean, maintainable code

Requirements:
- 3+ years of frontend development experience
- Expert knowledge of React, TypeScript, and modern JavaScript
- Experience with state management (Redux, MobX, etc.)
- Strong CSS skills and eye for design
- Bachelor's degree in Computer Science or related field

Nice to Have:
- Experience with GraphQL
- Knowledge of accessibility standards
- Contributions to open source projects`,
      notes: "Applied through referral. Hiring manager is Sarah Chen.",
      status: "INTERVIEW",
      dateApplied: new Date("2025-12-28"),
      nextFollowupAt: new Date("2026-01-08"),
    },
    {
      company: "Amazon",
      title: "Full Stack Developer",
      location: "Seattle, WA",
      jobLink: "https://amazon.jobs/en/jobs/789",
      salaryMin: 130000,
      salaryMax: 200000,
      source: "Indeed",
      interest: 7,
      description: `Amazon Web Services is seeking a Full Stack Developer to work on our customer-facing console applications.

Key Responsibilities:
- Develop and maintain web applications for AWS Console
- Work with RESTful APIs and microservices
- Implement responsive UI components
- Participate in agile development process

Required Skills:
- 4+ years of full stack development
- Proficiency in JavaScript/TypeScript, Node.js, React
- Experience with AWS services (EC2, S3, Lambda)
- Strong understanding of web security
- SQL and NoSQL database experience

Amazon offers:
- Competitive compensation
- Stock options
- Comprehensive benefits
- Career growth opportunities`,
      notes: "Need to prepare for system design interview.",
      status: "TO_APPLY",
    },
    {
      company: "Stripe",
      title: "Backend Engineer",
      location: "San Francisco, CA (Remote)",
      jobLink: "https://stripe.com/jobs/listing/backend-engineer",
      salaryMin: 160000,
      salaryMax: 240000,
      source: "AngelList",
      interest: 10,
      description: `Stripe is looking for a Backend Engineer to help build the financial infrastructure for the internet.

What We're Looking For:
- Strong programming skills in Ruby, Python, or Go
- Experience building and scaling APIs
- Understanding of payment systems and financial technology
- Excellent problem-solving abilities
- Strong communication skills

You Will:
- Design and build scalable backend services
- Work on payment processing systems
- Collaborate with product and design teams
- Ensure system reliability and security
- Participate in on-call rotation

Why Stripe:
- Work on products used by millions
- Remote-friendly culture
- Competitive compensation and equity
- Learning and development budget
- Generous parental leave`,
      notes: "Dream job! Need to highlight payment processing experience.",
      status: "SAVED",
    },
    {
      company: "Airbnb",
      title: "Mobile Engineer (iOS)",
      location: "Remote",
      jobLink: "https://careers.airbnb.com/positions/mobile-ios",
      salaryMin: 145000,
      salaryMax: 215000,
      source: "Glassdoor",
      interest: 8,
      description: `Join Airbnb's mobile team to create delightful experiences for travelers worldwide.

Requirements:
- 3+ years of iOS development experience
- Expert knowledge of Swift and iOS SDK
- Experience with SwiftUI and Combine
- Understanding of mobile architecture patterns (MVVM, Clean Architecture)
- Strong CS fundamentals

Responsibilities:
- Build and maintain iOS applications
- Implement new features and improvements
- Optimize app performance
- Write unit and integration tests
- Collaborate with cross-functional teams

Perks:
- Flexible work arrangements
- Travel credits
- Health and wellness benefits
- Stock options
- Professional development`,
      notes: "Need to brush up on SwiftUI.",
      status: "BACKLOG",
    },
  ];

  // Create jobs with applications
  for (const jobData of sampleJobs) {
    const { status, dateApplied, nextFollowupAt, ...jobFields } = jobData;

    const job = await prisma.job.create({
      data: {
        ...jobFields,
        userId: user.id,
        descPreview: jobData.description.slice(0, 100) + "...",
        applications: {
          create: {
            status: status as any,
            dateApplied,
            nextFollowupAt,
            dateSaved: new Date(),
          },
        },
      },
    });

    console.log(`✅ Created job: ${job.company} - ${job.title}`);
  }

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });