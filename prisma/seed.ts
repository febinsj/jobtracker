import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// Helper function to generate random date within a range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to get random item from array
function randomItem<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to get random number in range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Create a test user with hashed password
  const hashedPassword = await hash("demo123456", 12);
  
  const user = await prisma.user.upsert({
    where: { email: "demo@roleriser.com" },
    update: {},
    create: {
      email: "demo@roleriser.com",
      password: hashedPassword,
      firstName: "Demo",
      lastName: "User",
    },
  });

  console.log("✅ Created user:", user.email);

  // Delete existing jobs for this user to avoid duplicates
  await prisma.job.deleteMany({
    where: { userId: user.id }
  });

  // Companies data
  const companies = [
    { name: "Google", domain: "google.com" },
    { name: "Meta", domain: "meta.com" },
    { name: "Amazon", domain: "amazon.com" },
    { name: "Apple", domain: "apple.com" },
    { name: "Microsoft", domain: "microsoft.com" },
    { name: "Netflix", domain: "netflix.com" },
    { name: "Stripe", domain: "stripe.com" },
    { name: "Airbnb", domain: "airbnb.com" },
    { name: "Uber", domain: "uber.com" },
    { name: "Lyft", domain: "lyft.com" },
    { name: "Spotify", domain: "spotify.com" },
    { name: "Twitter/X", domain: "x.com" },
    { name: "LinkedIn", domain: "linkedin.com" },
    { name: "Salesforce", domain: "salesforce.com" },
    { name: "Adobe", domain: "adobe.com" },
    { name: "Shopify", domain: "shopify.com" },
    { name: "Slack", domain: "slack.com" },
    { name: "Zoom", domain: "zoom.us" },
    { name: "Dropbox", domain: "dropbox.com" },
    { name: "Figma", domain: "figma.com" },
    { name: "Notion", domain: "notion.so" },
    { name: "Vercel", domain: "vercel.com" },
    { name: "Supabase", domain: "supabase.com" },
    { name: "PlanetScale", domain: "planetscale.com" },
    { name: "Datadog", domain: "datadoghq.com" },
    { name: "Snowflake", domain: "snowflake.com" },
    { name: "Databricks", domain: "databricks.com" },
    { name: "Palantir", domain: "palantir.com" },
    { name: "Coinbase", domain: "coinbase.com" },
    { name: "Robinhood", domain: "robinhood.com" },
    { name: "Square/Block", domain: "block.xyz" },
    { name: "Plaid", domain: "plaid.com" },
    { name: "Twilio", domain: "twilio.com" },
    { name: "SendGrid", domain: "sendgrid.com" },
    { name: "MongoDB", domain: "mongodb.com" },
    { name: "Elastic", domain: "elastic.co" },
    { name: "HashiCorp", domain: "hashicorp.com" },
    { name: "GitLab", domain: "gitlab.com" },
    { name: "GitHub", domain: "github.com" },
    { name: "Atlassian", domain: "atlassian.com" },
  ];

  const titles = [
    "Software Engineer",
    "Senior Software Engineer",
    "Staff Software Engineer",
    "Principal Engineer",
    "Frontend Engineer",
    "Backend Engineer",
    "Full Stack Developer",
    "Mobile Engineer",
    "iOS Developer",
    "Android Developer",
    "DevOps Engineer",
    "Site Reliability Engineer",
    "Platform Engineer",
    "Data Engineer",
    "Machine Learning Engineer",
    "AI Engineer",
    "Security Engineer",
    "Cloud Engineer",
    "Infrastructure Engineer",
    "Engineering Manager",
  ];

  const locations = [
    "San Francisco, CA",
    "New York, NY",
    "Seattle, WA",
    "Austin, TX",
    "Los Angeles, CA",
    "Boston, MA",
    "Denver, CO",
    "Chicago, IL",
    "Remote",
    "Remote (US)",
    "Hybrid - San Francisco",
    "Hybrid - New York",
    "London, UK",
    "Toronto, Canada",
    "Berlin, Germany",
  ];

  const sources = [
    "LinkedIn",
    "Indeed",
    "Glassdoor",
    "Company Website",
    "AngelList",
    "Referral",
    "Recruiter",
    "Hacker News",
    "Y Combinator",
    "Wellfound",
  ];

  const statuses = [
    "BACKLOG",
    "SAVED",
    "TO_APPLY",
    "APPLIED",
    "ASSESSMENT",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
    "WITHDRAWN",
  ] as const;

  const stages = ["SCREENING", "TECHNICAL", "ONSITE", "FINAL"] as const;

  const descriptions = [
    `We're looking for a talented engineer to join our team. You'll work on building scalable systems that power our platform.

Requirements:
- 3+ years of software engineering experience
- Strong proficiency in modern programming languages
- Experience with distributed systems
- Excellent problem-solving skills

Responsibilities:
- Design and implement new features
- Collaborate with cross-functional teams
- Participate in code reviews
- Mentor junior engineers

Benefits:
- Competitive salary and equity
- Health, dental, and vision insurance
- Flexible work arrangements
- Professional development budget`,

    `Join our engineering team to build the next generation of our product. We're solving complex technical challenges at scale.

What You'll Do:
- Build and maintain high-performance applications
- Work with cutting-edge technologies
- Collaborate with product and design teams
- Drive technical decisions

Requirements:
- Strong CS fundamentals
- Experience with cloud platforms (AWS/GCP/Azure)
- Proficiency in TypeScript/JavaScript
- Understanding of CI/CD pipelines

Perks:
- Remote-first culture
- Unlimited PTO
- Stock options
- Learning stipend`,

    `We're seeking an experienced engineer to help us scale our infrastructure and improve developer experience.

Key Responsibilities:
- Architect and build scalable systems
- Improve system reliability and performance
- Implement monitoring and alerting
- Document technical decisions

Qualifications:
- 5+ years of relevant experience
- Experience with containerization (Docker, Kubernetes)
- Strong debugging and troubleshooting skills
- Excellent communication abilities

What We Offer:
- Competitive compensation
- Comprehensive benefits
- Career growth opportunities
- Collaborative environment`,

    `Looking for a passionate engineer to join our fast-growing team. You'll have the opportunity to make a significant impact.

About the Role:
- Work on challenging technical problems
- Ship features that millions of users rely on
- Contribute to technical architecture decisions
- Help build our engineering culture

Requirements:
- Bachelor's degree in CS or equivalent
- Experience with modern web frameworks
- Strong analytical skills
- Team player mindset

Benefits Package:
- Top-tier salary
- Equity compensation
- Health and wellness benefits
- Flexible schedule`,

    `Join us to build products that make a difference. We're looking for engineers who are passionate about their craft.

Responsibilities:
- Develop and maintain core platform features
- Write clean, testable code
- Participate in agile ceremonies
- Contribute to technical documentation

Skills Required:
- Proficiency in Python, Go, or Java
- Database design experience
- API development skills
- Version control expertise

Why Join Us:
- Mission-driven company
- Talented team
- Growth opportunities
- Great work-life balance`,
  ];

  const notes = [
    "Reached out to recruiter on LinkedIn. Waiting for response.",
    "Have a referral from a friend who works there.",
    "Applied through company website. Strong match for my skills.",
    "Recruiter reached out to me. Scheduling initial call.",
    "Need to prepare for system design interview.",
    "Completed coding assessment. Waiting for results.",
    "Phone screen went well. Moving to technical round.",
    "Technical interview scheduled for next week.",
    "Onsite interview completed. Waiting for feedback.",
    "Received offer! Need to negotiate salary.",
    "Rejected after final round. Will try again in 6 months.",
    "Withdrew application - found better opportunity.",
    "Great company culture. Would be a good fit.",
    "Salary range is lower than expected.",
    "Interesting tech stack. Want to learn more.",
    "Remote position - perfect for my situation.",
    "Fast-growing startup with good funding.",
    "Established company with stable growth.",
    "",
    "",
    "",
  ];

  // Date ranges
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Generate 50 jobs
  const jobsToCreate = [];
  
  for (let i = 0; i < 50; i++) {
    const company = randomItem(companies);
    const title = randomItem(titles);
    const status = randomItem(statuses);
    const dateSaved = randomDate(threeMonthsAgo, now);
    
    // Determine dateApplied based on status
    let dateApplied: Date | null = null;
    if (["APPLIED", "ASSESSMENT", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"].includes(status)) {
      dateApplied = randomDate(dateSaved, now);
    }

    // Determine nextFollowupAt for active applications
    let nextFollowupAt: Date | null = null;
    if (["APPLIED", "ASSESSMENT", "INTERVIEW"].includes(status)) {
      nextFollowupAt = randomDate(now, oneMonthFromNow);
    }

    // Determine deadline for some jobs
    let deadline: Date | null = null;
    if (["SAVED", "TO_APPLY", "BACKLOG"].includes(status) && Math.random() > 0.5) {
      deadline = randomDate(now, oneMonthFromNow);
    }

    // Determine stage for interview status
    let stage: typeof stages[number] | null = null;
    if (status === "INTERVIEW") {
      stage = randomItem([...stages]);
    }

    const salaryMin = randomInt(80, 180) * 1000;
    const salaryMax = salaryMin + randomInt(30, 100) * 1000;

    jobsToCreate.push({
      company: company.name,
      title,
      location: randomItem(locations),
      jobLink: `https://careers.${company.domain}/jobs/${randomInt(10000, 99999)}`,
      salaryMin,
      salaryMax,
      source: randomItem(sources),
      interest: randomInt(1, 10),
      description: randomItem(descriptions),
      notes: randomItem(notes),
      status,
      stage,
      dateSaved,
      dateApplied,
      nextFollowupAt,
      deadline,
    });
  }

  // Create jobs with applications
  for (const jobData of jobsToCreate) {
    const { status, stage, dateSaved, dateApplied, nextFollowupAt, deadline, ...jobFields } = jobData;

    const job = await prisma.job.create({
      data: {
        ...jobFields,
        userId: user.id,
        descPreview: jobFields.description.slice(0, 100) + "...",
        createdAt: dateSaved,
        applications: {
          create: {
            status: status as any,
            stage: stage as any,
            dateApplied,
            dateSaved,
            nextFollowupAt,
            deadline,
          },
        },
      },
    });

    console.log(`✅ Created job: ${job.company} - ${job.title} (${status})`);
  }

  // Create some interviews for jobs in INTERVIEW status
  const interviewJobs = await prisma.application.findMany({
    where: { status: "INTERVIEW" },
    include: { job: true },
  });

  const interviewTypes = ["Phone Screen", "Technical", "Behavioral", "System Design", "Onsite", "Final"];
  const interviewOutcomes = ["Passed", "Pending", null];
  const interviewLocations = ["Remote (Zoom)", "Remote (Google Meet)", "Office", "Phone"];

  for (const app of interviewJobs) {
    const numInterviews = randomInt(1, 3);
    for (let i = 0; i < numInterviews; i++) {
      await prisma.interview.create({
        data: {
          applicationId: app.id,
          type: randomItem(interviewTypes),
          scheduledAt: randomDate(threeMonthsAgo, oneMonthFromNow),
          duration: randomItem([30, 45, 60, 90]),
          location: randomItem(interviewLocations),
          interviewer: `${randomItem(["John", "Sarah", "Mike", "Emily", "David", "Lisa"])} ${randomItem(["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia"])}`,
          notes: randomItem(["Prepare system design examples", "Review data structures", "Practice behavioral questions", ""]),
          outcome: randomItem(interviewOutcomes),
        },
      });
    }
    console.log(`✅ Created ${numInterviews} interview(s) for ${app.job.company}`);
  }

  // Create some contacts for random applications
  const allApplications = await prisma.application.findMany({
    include: { job: true },
    take: 20,
  });

  const firstNames = ["John", "Sarah", "Mike", "Emily", "David", "Lisa", "Chris", "Amanda", "James", "Jennifer"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Martinez", "Wilson"];
  const roles = ["Recruiter", "Hiring Manager", "Engineering Manager", "Tech Lead", "HR", "Talent Acquisition"];

  for (const app of allApplications) {
    if (Math.random() > 0.5) {
      const firstName = randomItem(firstNames);
      const lastName = randomItem(lastNames);
      await prisma.contact.create({
        data: {
          applicationId: app.id,
          name: `${firstName} ${lastName}`,
          role: randomItem(roles),
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${app.job.company.toLowerCase().replace(/[^a-z]/g, "")}.com`,
          linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
          notes: randomItem(["Very responsive", "Met at career fair", "Referred by friend", ""]),
        },
      });
      console.log(`✅ Created contact for ${app.job.company}`);
    }
  }

  console.log("\n🎉 Seeding completed!");
  console.log(`📊 Created 50 jobs with various statuses and dates`);
  console.log(`📧 Login with: demo@roleriser.com / demo123456`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });