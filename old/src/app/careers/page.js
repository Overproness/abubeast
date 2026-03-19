"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FeatureIcon,
  GlassCard,
  GradientOrb,
  GradientText,
} from "@/components/ui/glass";
import { PageHeader } from "@/components/ui/page-header.jsx";
import {
  ArrowRight,
  Briefcase,
  Building,
  ChevronRight,
  Clock,
  Coffee,
  DollarSign,
  Globe,
  Heart,
  Laptop,
  MapPin,
  Star,
  Users,
} from "lucide-react";

export default function CareersPage() {
  const benefits = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: "Competitive Salary",
      description:
        "Industry-leading compensation packages with equity options and performance bonuses.",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Flexible Hours",
      description:
        "Work-life balance with flexible schedules and remote work opportunities.",
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Health & Wellness",
      description:
        "Comprehensive health insurance, dental, vision, and wellness programs.",
    },
    {
      icon: <Coffee className="w-5 h-5" />,
      title: "Learning & Development",
      description:
        "Continuous learning budget, conferences, workshops, and certification programs.",
    },
    {
      icon: <Laptop className="w-5 h-5" />,
      title: "Latest Tech",
      description:
        "Top-tier hardware and software to help you do your best work.",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Global Team",
      description:
        "Work with talented individuals from around the world in a diverse environment.",
    },
  ];

  const openPositions = [
    {
      title: "Senior Full Stack Developer",
      department: "Engineering",
      location: "Remote / San Francisco",
      type: "Full-time",
      description:
        "Build and scale our trading platform using React, Node.js, and blockchain technologies.",
      requirements: [
        "5+ years of full-stack development",
        "Experience with React and Node.js",
        "Blockchain knowledge preferred",
      ],
    },
    {
      title: "Blockchain Engineer",
      department: "Engineering",
      location: "Remote / New York",
      type: "Full-time",
      description:
        "Develop smart contracts and DeFi protocols for our decentralized trading features.",
      requirements: [
        "3+ years of blockchain development",
        "Solidity and Web3 expertise",
        "Understanding of DeFi protocols",
      ],
    },
    {
      title: "AI/ML Engineer",
      department: "Data Science",
      location: "Remote",
      type: "Full-time",
      description:
        "Build and improve our AI trading algorithms and predictive models.",
      requirements: [
        "3+ years of ML experience",
        "Python and TensorFlow/PyTorch",
        "Financial modeling experience",
      ],
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote / London",
      type: "Full-time",
      description:
        "Design intuitive user experiences for our trading platform.",
      requirements: [
        "4+ years of product design",
        "Experience with Figma",
        "Fintech/trading experience preferred",
      ],
    },
    {
      title: "DevOps Engineer",
      department: "Infrastructure",
      location: "Remote",
      type: "Full-time",
      description:
        "Manage our cloud infrastructure and ensure platform reliability.",
      requirements: [
        "3+ years of DevOps experience",
        "AWS/GCP expertise",
        "Kubernetes and Terraform",
      ],
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote / Singapore",
      type: "Full-time",
      description:
        "Help traders succeed with our platform through excellent support and guidance.",
      requirements: [
        "2+ years in customer success",
        "Crypto/trading knowledge",
        "Excellent communication skills",
      ],
    },
  ];

  const values = [
    {
      title: "Innovation First",
      description:
        "We push the boundaries of what's possible in automated trading.",
    },
    {
      title: "User Obsession",
      description: "Every decision starts with how it benefits our traders.",
    },
    {
      title: "Transparency",
      description: "We believe in open communication and honest feedback.",
    },
    {
      title: "Continuous Learning",
      description:
        "We encourage growth, experimentation, and learning from failures.",
    },
  ];

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="Join Us"
        badgeIcon={<Briefcase className="w-4 h-4 mr-2" />}
        title="Build the Future of Trading"
        subtitle="Join our team and help revolutionize automated cryptocurrency trading"
        size="small"
      />

      <div className="section-container py-12 relative">
        <GradientOrb
          color="blue"
          className="w-[500px] h-[500px] top-0 left-0 opacity-10 fixed"
        />
        <GradientOrb
          color="violet"
          className="w-[400px] h-[400px] bottom-0 right-0 opacity-10 fixed"
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { value: "50+", label: "Team Members" },
            { value: "15+", label: "Countries" },
            { value: "$50M+", label: "Trading Volume" },
            { value: "100K+", label: "Active Traders" },
          ].map((stat, index) => (
            <GlassCard key={index} className="p-6 text-center">
              <p className="text-3xl font-bold">
                <GradientText>{stat.value}</GradientText>
              </p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">
            <GradientText>Our Values</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value, index) => (
              <GlassCard key={index} className="p-5 text-center">
                <Star className="w-6 h-6 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">
            <GradientText>Benefits & Perks</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <GlassCard key={index} className="p-5">
                <div className="flex items-start gap-4">
                  <FeatureIcon>{benefit.icon}</FeatureIcon>
                  <div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              <GradientText>Open Positions</GradientText>
            </h2>
            <Badge>{openPositions.length} openings</Badge>
          </div>
          <div className="space-y-4">
            {openPositions.map((position, index) => (
              <GlassCard
                key={index}
                className="p-6 hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {position.title}
                      </h3>
                      <Badge variant="outline">{position.type}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      {position.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {position.location}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="group-hover:bg-primary group-hover:text-white group-hover:border-primary"
                  >
                    Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* CTA */}
        <GlassCard className="p-8 bg-gradient-to-br from-primary/10 to-purple-400/10 text-center">
          <Users className="w-10 h-10 mx-auto text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Don't See Your Role?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            We're always looking for talented individuals. Send us your resume
            and we'll keep you in mind for future opportunities.
          </p>
          <Button size="lg">
            Send Your Resume <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </GlassCard>
      </div>
    </main>
  );
}
