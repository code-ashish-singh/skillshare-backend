/**
 * Database seeder — creates admin, sample users, providers, skills, plans
 * Usage: npm run seed
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Skill from "../models/Skill.js";
import Plan from "../models/Plan.js";
import Blog from "../models/Blog.js";

const seed = async () => {
  await connectDB();
  console.log("🌱 Seeding database...\n");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Skill.deleteMany({}),
    Plan.deleteMany({}),
    Blog.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  // ─── Super Admin ──────────────────────────────────────────────────────────
  const admin = await User.create({
    name: "Rakesh Sharma",
    email: "admin@skillshare.com",
    password: "admin123",
    role: "superAdmin",
    avatar: "https://i.pravatar.cc/150?img=70",
    bio: "Platform administrator",
    isVerified: true,
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // ─── Skill Seekers ────────────────────────────────────────────────────────
  const seekers = await User.insertMany([
    {
      name: "Arjun Mehta",
      email: "seeker@demo.com",
      password: await bcrypt.hash("demo123", 12),
      role: "skillSeeker",
      avatar: "https://i.pravatar.cc/150?img=12",
      bio: "Mumbai mein startup founder hoon. Tech aur design services dhundh raha hoon.",
      phone: "+91 98201 11234",
      location: "Mumbai, Maharashtra",
      isVerified: true,
    },
    {
      name: "Sneha Patel",
      email: "sneha@demo.com",
      password: await bcrypt.hash("demo123", 12),
      role: "skillSeeker",
      avatar: "https://i.pravatar.cc/150?img=25",
      bio: "E-commerce business owner, Ahmedabad.",
      phone: "+91 97390 22345",
      location: "Ahmedabad, Gujarat",
      isVerified: true,
    },
    {
      name: "Rohan Verma",
      email: "rohan@demo.com",
      password: await bcrypt.hash("demo123", 12),
      role: "skillSeeker",
      avatar: "https://i.pravatar.cc/150?img=60",
      bio: "Digital marketing agency chalata hoon, Delhi mein.",
      phone: "+91 99100 33456",
      location: "New Delhi",
      isVerified: true,
    },
    {
      name: "Priya Nair",
      email: "priya.nair@demo.com",
      password: await bcrypt.hash("demo123", 12),
      role: "skillSeeker",
      avatar: "https://i.pravatar.cc/150?img=44",
      bio: "Fashion brand ki founder hoon, Bangalore se.",
      phone: "+91 80901 44567",
      location: "Bengaluru, Karnataka",
      isVerified: true,
    },
  ]);
  console.log(`✅ ${seekers.length} seekers created`);

  // ─── Skill Providers ──────────────────────────────────────────────────────
  const hashedPw = await bcrypt.hash("demo123", 12);

  const providers = await User.insertMany([
    {
      name: "Vikram Singh",
      email: "provider@demo.com",
      password: hashedPw,
      role: "skillProvider",
      avatar: "https://i.pravatar.cc/150?img=11",
      bio: "10+ saal ka experience hai scalable web apps banane mein. React, Node.js aur AWS mein specialist hoon. 90+ projects successfully deliver kiye hain startups aur enterprises ke liye.",
      location: "Bengaluru, Karnataka",
      phone: "+91 98450 55678",
      isVerified: true,
      providerProfile: {
        rating: 4.9, totalReviews: 128, completedProjects: 94,
        ongoingProjects: 3, pendingProjects: 2,
        totalEarnings: 850000,
        verificationStatus: "Verified",
        languages: ["Hindi", "English", "Kannada"],
        responseTime: "1 ghante",
        socialLinks: {
          website: "https://vikramsingh.dev",
          github: "https://github.com/vikramsingh",
          linkedin: "https://linkedin.com/in/vikramsingh",
        },
      },
    },
    {
      name: "Ananya Krishnan",
      email: "ananya@demo.com",
      password: hashedPw,
      role: "skillProvider",
      avatar: "https://i.pravatar.cc/150?img=5",
      bio: "Award-winning UI/UX designer hoon, 7 saal ka experience. Figma mein expert hoon aur user-centered design mein specialization hai. 75+ clients ke liye kaam kar chuki hoon.",
      location: "Chennai, Tamil Nadu",
      phone: "+91 94440 66789",
      isVerified: true,
      providerProfile: {
        rating: 4.8, totalReviews: 94, completedProjects: 78,
        ongoingProjects: 2, pendingProjects: 3,
        totalEarnings: 620000,
        verificationStatus: "Verified",
        languages: ["Tamil", "English", "Hindi"],
        responseTime: "2 ghante",
        socialLinks: {
          website: "https://ananyadesigns.in",
          linkedin: "https://linkedin.com/in/ananyakrishnan",
        },
      },
    },
    {
      name: "Rahul Gupta",
      email: "rahul@demo.com",
      password: hashedPw,
      role: "skillProvider",
      avatar: "https://i.pravatar.cc/150?img=15",
      bio: "React Native aur Flutter developer hoon. 6 saal mein 20+ apps App Store aur Play Store pe publish kar chuka hoon. Delhi ka rehne wala hoon.",
      location: "New Delhi",
      phone: "+91 99111 77890",
      isVerified: true,
      providerProfile: {
        rating: 4.7, totalReviews: 67, completedProjects: 52,
        ongoingProjects: 4, pendingProjects: 1,
        totalEarnings: 480000,
        verificationStatus: "Verified",
        languages: ["Hindi", "English"],
        responseTime: "3 ghante",
        socialLinks: {
          github: "https://github.com/rahulgupta",
        },
      },
    },
    {
      name: "Meera Iyer",
      email: "meera@demo.com",
      password: hashedPw,
      role: "skillProvider",
      avatar: "https://i.pravatar.cc/150?img=9",
      bio: "Graphic designer hoon, 8 saal ka experience. Brand identity, logo design aur marketing materials mein specialist. Pune mein kaam karti hoon.",
      location: "Pune, Maharashtra",
      phone: "+91 97300 88901",
      isVerified: true,
      providerProfile: {
        rating: 4.9, totalReviews: 156, completedProjects: 210,
        ongoingProjects: 5, pendingProjects: 4,
        totalEarnings: 950000,
        verificationStatus: "Verified",
        languages: ["Marathi", "Hindi", "English"],
        responseTime: "30 minute",
        socialLinks: {
          website: "https://meeradesigns.in",
          linkedin: "https://linkedin.com/in/meeraiyer",
        },
      },
    },
    {
      name: "Karthik Reddy",
      email: "karthik@demo.com",
      password: hashedPw,
      role: "skillProvider",
      avatar: "https://i.pravatar.cc/150?img=18",
      bio: "SEO content writer hoon, 5 saal ka experience. 50+ Indian brands ke liye kaam kiya hai — tech, finance, aur health niche mein. Hyderabad se hoon.",
      location: "Hyderabad, Telangana",
      phone: "+91 90000 99012",
      isVerified: true,
      providerProfile: {
        rating: 4.6, totalReviews: 83, completedProjects: 340,
        ongoingProjects: 12, pendingProjects: 6,
        totalEarnings: 380000,
        verificationStatus: "Verified",
        languages: ["Telugu", "Hindi", "English"],
        responseTime: "1 ghante",
        socialLinks: {
          linkedin: "https://linkedin.com/in/karthikreddy",
        },
      },
    },
    {
      name: "Divya Malhotra",
      email: "divya@demo.com",
      password: hashedPw,
      role: "skillProvider",
      avatar: "https://i.pravatar.cc/150?img=16",
      bio: "Performance marketing expert hoon. Google Ads aur Meta Ads mein certified hoon. 6 saal mein ₹2 crore+ ka ad spend manage kiya hai. Gurugram se hoon.",
      location: "Gurugram, Haryana",
      phone: "+91 98760 10123",
      isVerified: true,
      providerProfile: {
        rating: 4.8, totalReviews: 72, completedProjects: 63,
        ongoingProjects: 4, pendingProjects: 3,
        totalEarnings: 540000,
        verificationStatus: "Verified",
        languages: ["Hindi", "English", "Punjabi"],
        responseTime: "2 ghante",
        socialLinks: {
          linkedin: "https://linkedin.com/in/divyamalhotra",
          website: "https://divyaads.in",
        },
      },
    },
  ]);
  console.log(`✅ ${providers.length} providers created`);

  // ─── Skills & Plans ───────────────────────────────────────────────────────

  // 1. Vikram — Web Development
  const webSkill = await Skill.create({
    title: "Full Stack Web Development",
    description: "React, Node.js, MongoDB aur AWS use karke complete web applications banata hoon. Simple landing page se lekar complex SaaS platform tak sab kuch.",
    category: "Web Development",
    provider: providers[0]._id,
    tags: ["React", "Node.js", "MongoDB", "AWS", "TypeScript"],
    rating: 4.9, completedProjects: 94,
    isActive: true,
  });
  const webPlans = await Plan.insertMany([
    { name: "Basic", description: "Simple landing page ke liye", price: 4999, deliveryTime: "3 din", revisions: 2, features: ["1 landing page", "Responsive design", "Contact form", "Basic SEO"], skill: webSkill._id, provider: providers[0]._id },
    { name: "Standard", description: "Multi-page website with CMS", price: 14999, deliveryTime: "7 din", revisions: 5, features: ["5 pages tak", "CMS integration", "SEO setup", "Analytics", "Contact forms"], skill: webSkill._id, provider: providers[0]._id },
    { name: "Premium", description: "Full web app with admin panel", price: 34999, deliveryTime: "14 din", revisions: "Unlimited", features: ["Full web app", "API integration", "Admin panel", "Deployment", "30 din support"], skill: webSkill._id, provider: providers[0]._id },
  ]);
  webSkill.plans = webPlans.map(p => p._id);
  webSkill.startingPrice = 4999;
  await webSkill.save();
  await User.findByIdAndUpdate(providers[0]._id, { $push: { "providerProfile.skills": webSkill._id } });

  // 2. Ananya — UI/UX Design
  const designSkill = await Skill.create({
    title: "UI/UX Design",
    description: "Figma use karke beautiful, user-centered designs banati hoon. Wireframes se lekar full design systems tak.",
    category: "UI/UX Design",
    provider: providers[1]._id,
    tags: ["Figma", "Prototyping", "User Research", "Design Systems", "Wireframing"],
    rating: 4.8, completedProjects: 78,
    isActive: true,
  });
  const designPlans = await Plan.insertMany([
    { name: "Basic", description: "Simple screen designs", price: 3999, deliveryTime: "2 din", revisions: 2, features: ["3 screens", "Wireframes", "Basic prototype"], skill: designSkill._id, provider: providers[1]._id },
    { name: "Standard", description: "Full UI design package", price: 12999, deliveryTime: "5 din", revisions: 4, features: ["10 screens", "Hi-fi designs", "Interactive prototype", "Design handoff"], skill: designSkill._id, provider: providers[1]._id },
    { name: "Premium", description: "Complete design system", price: 29999, deliveryTime: "12 din", revisions: "Unlimited", features: ["Full design system", "50+ screens", "User testing", "Dev specs"], skill: designSkill._id, provider: providers[1]._id },
  ]);
  designSkill.plans = designPlans.map(p => p._id);
  designSkill.startingPrice = 3999;
  await designSkill.save();
  await User.findByIdAndUpdate(providers[1]._id, { $push: { "providerProfile.skills": designSkill._id } });

  // 3. Rahul — Mobile App Development
  const mobileSkill = await Skill.create({
    title: "Mobile App Development",
    description: "React Native aur Flutter mein cross-platform mobile apps banata hoon. iOS aur Android dono ke liye.",
    category: "Mobile Development",
    provider: providers[2]._id,
    tags: ["React Native", "Flutter", "iOS", "Android", "Firebase"],
    rating: 4.7, completedProjects: 52,
    isActive: true,
  });
  const mobilePlans = await Plan.insertMany([
    { name: "Basic", description: "Simple app, 5 screens", price: 5999, deliveryTime: "5 din", revisions: 2, features: ["Simple app", "5 screens", "Basic auth"], skill: mobileSkill._id, provider: providers[2]._id },
    { name: "Standard", description: "15 screens with notifications", price: 19999, deliveryTime: "14 din", revisions: 4, features: ["15 screens", "Push notifications", "API integration", "Dono platforms"], skill: mobileSkill._id, provider: providers[2]._id },
    { name: "Premium", description: "Full mobile app with dashboard", price: 49999, deliveryTime: "30 din", revisions: "Unlimited", features: ["Full mobile app", "Admin dashboard", "Analytics", "App store deployment", "3 mahine support"], skill: mobileSkill._id, provider: providers[2]._id },
  ]);
  mobileSkill.plans = mobilePlans.map(p => p._id);
  mobileSkill.startingPrice = 5999;
  await mobileSkill.save();
  await User.findByIdAndUpdate(providers[2]._id, { $push: { "providerProfile.skills": mobileSkill._id } });

  // 4. Meera — Graphic Design
  const graphicSkill = await Skill.create({
    title: "Logo aur Brand Identity Design",
    description: "Professional logo aur complete brand identity banati hoon. Startups se lekar established businesses tak ke liye. Har design unique aur memorable hota hai.",
    category: "Graphic Design",
    provider: providers[3]._id,
    tags: ["Photoshop", "Illustrator", "Branding", "Logo Design", "Typography"],
    rating: 4.9, completedProjects: 210,
    isActive: true,
  });
  const graphicPlans = await Plan.insertMany([
    { name: "Basic", description: "Logo design, 2 concepts", price: 2499, deliveryTime: "1 din", revisions: 3, features: ["Logo design", "2 concepts", "PNG/SVG files"], skill: graphicSkill._id, provider: providers[3]._id },
    { name: "Standard", description: "Full brand kit", price: 8999, deliveryTime: "3 din", revisions: 5, features: ["Full brand kit", "5 concepts", "Style guide", "Sabhi file formats"], skill: graphicSkill._id, provider: providers[3]._id },
    { name: "Premium", description: "Complete brand identity", price: 19999, deliveryTime: "7 din", revisions: "Unlimited", features: ["Complete brand identity", "Stationery design", "Social media kit", "Brand guidelines"], skill: graphicSkill._id, provider: providers[3]._id },
  ]);
  graphicSkill.plans = graphicPlans.map(p => p._id);
  graphicSkill.startingPrice = 2499;
  await graphicSkill.save();
  await User.findByIdAndUpdate(providers[3]._id, { $push: { "providerProfile.skills": graphicSkill._id } });

  // 5. Karthik — Content Writing
  const contentSkill = await Skill.create({
    title: "SEO Content Writing",
    description: "Hindi aur English mein SEO-optimized content likhta hoon jo rank kare aur convert kare. Blogs, articles, website copy sab.",
    category: "Content Writing",
    provider: providers[4]._id,
    tags: ["SEO Writing", "Blog Content", "Copywriting", "Hindi Content", "Technical Writing"],
    rating: 4.6, completedProjects: 340,
    isActive: true,
  });
  const contentPlans = await Plan.insertMany([
    { name: "Basic", description: "500 words SEO article", price: 1499, deliveryTime: "1 din", revisions: 2, features: ["500 words article", "SEO optimized", "1 revision"], skill: contentSkill._id, provider: providers[4]._id },
    { name: "Standard", description: "2000 words detailed article", price: 4999, deliveryTime: "3 din", revisions: 4, features: ["2000 words article", "Keyword research", "Meta tags", "Images suggestions"], skill: contentSkill._id, provider: providers[4]._id },
    { name: "Premium", description: "5 articles content package", price: 14999, deliveryTime: "7 din", revisions: "Unlimited", features: ["5 articles", "Content strategy", "Internal linking", "Social media posts"], skill: contentSkill._id, provider: providers[4]._id },
  ]);
  contentSkill.plans = contentPlans.map(p => p._id);
  contentSkill.startingPrice = 1499;
  await contentSkill.save();
  await User.findByIdAndUpdate(providers[4]._id, { $push: { "providerProfile.skills": contentSkill._id } });

  // 6. Divya — Digital Marketing
  const marketingSkill = await Skill.create({
    title: "Google Ads aur Meta Ads Management",
    description: "Performance marketing expert hoon. Google aur Meta ads campaigns run karti hoon jo real ROI dete hain. ₹2 crore+ ka ad spend manage kiya hai.",
    category: "Digital Marketing",
    provider: providers[5]._id,
    tags: ["Google Ads", "Meta Ads", "Facebook Ads", "PPC", "Analytics"],
    rating: 4.8, completedProjects: 63,
    isActive: true,
  });
  const marketingPlans = await Plan.insertMany([
    { name: "Basic", description: "Campaign setup, 1 platform", price: 3499, deliveryTime: "3 din", revisions: 2, features: ["Campaign setup", "1 platform", "7 din management"], skill: marketingSkill._id, provider: providers[5]._id },
    { name: "Standard", description: "3 platforms with A/B testing", price: 12999, deliveryTime: "7 din", revisions: 4, features: ["3 platforms", "A/B testing", "Monthly report", "Optimization"], skill: marketingSkill._id, provider: providers[5]._id },
    { name: "Premium", description: "Full funnel strategy", price: 34999, deliveryTime: "Ongoing", revisions: "Unlimited", features: ["Full funnel strategy", "Sabhi platforms", "Weekly reports", "Dedicated manager"], skill: marketingSkill._id, provider: providers[5]._id },
  ]);
  marketingSkill.plans = marketingPlans.map(p => p._id);
  marketingSkill.startingPrice = 3499;
  await marketingSkill.save();
  await User.findByIdAndUpdate(providers[5]._id, { $push: { "providerProfile.skills": marketingSkill._id } });

  console.log(`✅ Skills aur Plans seeded`);

  // ─── Blogs ────────────────────────────────────────────────────────────────
  await Blog.insertMany([
    {
      title: "Apne Startup ke liye Sahi Freelance Developer Kaise Dhundhe",
      content: "Sahi developer dhundhna aapke startup ki success ke liye bahut zaroori hai. Yahan kuch important points hain jo aapko dhyan mein rakhne chahiye: portfolio dekho, communication style check karo, technical interview lo, aur past client reviews padho. India mein bahut talented developers hain jo affordable rates pe kaam karte hain...",
      excerpt: "Apne project ke liye best developer hire karne ke liye zaroori tips.",
      category: "Hiring Tips", status: "Published",
      author: admin._id,
      readTime: "5 min",
      coverImage: "https://picsum.photos/seed/blog1/600/350",
      tags: ["hiring", "developers", "startup", "india"],
    },
    {
      title: "2025 ke Top UI/UX Design Trends jo Aapko Jaanne Chahiye",
      content: "Design ki duniya bahut tezi se badal rahi hai. Glassmorphism se lekar AI-assisted design tak, yahan hain woh trends jo har designer ko pata hone chahiye. Indian market mein bhi yeh trends bahut popular ho rahe hain...",
      excerpt: "2025 mein UI/UX design ke sabse hot trends explore karo.",
      category: "Design", status: "Published",
      author: admin._id,
      readTime: "7 min",
      coverImage: "https://picsum.photos/seed/blog2/600/350",
      tags: ["design", "trends", "UI", "UX", "2025"],
    },
    {
      title: "Freelancing mein Safal Hone ke 10 Tips — Indian Freelancers ke liye",
      content: "India mein freelancing bahut tezi se badh rahi hai. Agar aap bhi ek successful freelancer banna chahte hain toh yeh tips aapke kaam aayengi. Portfolio banana, clients dhundhna, pricing set karna — sab cover karenge...",
      excerpt: "Indian freelancers ke liye practical tips jo career ko boost karein.",
      category: "Guide", status: "Published",
      author: admin._id,
      readTime: "8 min",
      coverImage: "https://picsum.photos/seed/blog3/600/350",
      tags: ["freelancing", "career", "india", "tips"],
    },
    {
      title: "Node.js vs Python — Backend Development ke liye Kya Choose Karein",
      content: "Backend technology choose karna ek important decision hai. Node.js aur Python dono ke apne advantages hain. Indian software industry mein dono ka use bahut zyada hai. Is article mein hum dono ko compare karenge...",
      excerpt: "Backend ke liye Node.js ya Python — complete comparison.",
      category: "Development", status: "Published",
      author: admin._id,
      readTime: "6 min",
      coverImage: "https://picsum.photos/seed/blog4/600/350",
      tags: ["nodejs", "python", "backend", "development"],
    },
  ]);
  console.log(`✅ Blogs seeded`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log("\n📋 Demo Credentials:");
  console.log("   Admin:    admin@skillshare.com  / admin123");
  console.log("   Seeker:   seeker@demo.com       / demo123");
  console.log("   Provider: provider@demo.com     / demo123");
  console.log("\n👥 Extra Providers:");
  console.log("   ananya@demo.com   / demo123  (UI/UX Designer)");
  console.log("   rahul@demo.com    / demo123  (Mobile Developer)");
  console.log("   meera@demo.com    / demo123  (Graphic Designer)");
  console.log("   karthik@demo.com  / demo123  (Content Writer)");
  console.log("   divya@demo.com    / demo123  (Digital Marketer)");
  console.log("\n🎉 Database seeded successfully!\n");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
