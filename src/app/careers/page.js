"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { motion } from "framer-motion";
import {
  Building,
  Clock,
  Coffee,
  DollarSign,
  Globe,
  Heart,
  Laptop,
  MapPin,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function CareersPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Competitive Salary",
      description:
        "Industry-leading compensation packages with equity options and performance bonuses.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Flexible Hours",
      description:
        "Work-life balance with flexible schedules and remote work opportunities.",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Health & Wellness",
      description:
        "Comprehensive health insurance, dental, vision, and wellness programs.",
    },
    {
      icon: <Coffee className="w-6 h-6" />,
      title: "Learning & Development",
      description:
        "Continuous learning budget, conferences, workshops, and certification programs.",
    },
    {
      icon: <Laptop className="w-6 h-6" />,
      title: "Latest Tech",
      description:
        "Top-tier hardware and software to help you do your best work.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
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
        "Experience with DeFi protocols",
      ],
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote / London",
      type: "Full-time",
      description:
        "Design intuitive user experiences for our trading platform and mobile applications.",
      requirements: [
        "4+ years of product design",
        "Experience with fintech products",
        "Strong portfolio in UX/UI",
      ],
    },
    {
      title: "DevOps Engineer",
      department: "Infrastructure",
      location: "Remote / Berlin",
      type: "Full-time",
      description:
        "Manage and scale our cloud infrastructure to support millions of trading operations.",
      requirements: [
        "3+ years of DevOps experience",
        "AWS/GCP expertise",
        "Kubernetes and Docker",
      ],
    },
    {
      title: "Security Engineer",
      department: "Security",
      location: "Remote / Tokyo",
      type: "Full-time",
      description:
        "Ensure the security of our platform and protect user assets across all systems.",
      requirements: [
        "4+ years of security engineering",
        "Penetration testing experience",
        "Blockchain security knowledge",
      ],
    },
    {
      title: "Marketing Manager",
      department: "Marketing",
      location: "Remote / Austin",
      type: "Full-time",
      description:
        "Lead our marketing efforts and grow our community of traders and developers.",
      requirements: [
        "3+ years of marketing experience",
        "Crypto/fintech background",
        "Community building skills",
      ],
    },
  ];

  const values = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Innovation First",
      description:
        "We constantly push boundaries and embrace cutting-edge technologies to revolutionize trading.",
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Team Collaboration",
      description:
        "We believe in the power of diverse teams working together towards common goals.",
    },
    {
      icon: <Star className="w-8 h-8 text-purple-500" />,
      title: "Excellence",
      description:
        "We strive for excellence in everything we do, from code quality to customer experience.",
    },
    {
      icon: <Globe className="w-8 h-8 text-green-500" />,
      title: "Global Impact",
      description:
        "We're building technology that empowers people worldwide to participate in the future of finance.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Join Our Mission"
        subtitle="Build the future of decentralized finance"
        description="We're looking for passionate individuals who want to shape the next generation of trading technology. Join our team of innovators, builders, and dreamers."
        gradient
        animatedBlobs
        size="large"
      >
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button size="lg" asChild className="px-8 py-4 text-lg">
            <a href="#positions">View Open Positions</a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="px-8 py-4 text-lg"
          >
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {/* Why Join Us */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.div variants={fadeInUp} className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Join AbuBeast?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're not just building a company; we're creating the
              infrastructure for the future of finance. Join us and be part of
              something revolutionary.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 group border-0 bg-gradient-to-br from-card to-card/50">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                      {benefit.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Our Values */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="bg-muted/30 rounded-3xl p-8 md:p-12"
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              These principles guide everything we do and shape our company
              culture.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-background rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Open Positions */}
        <motion.section
          id="positions"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Open Positions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join our growing team and help us build the future of
              decentralized finance.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid gap-6">
            {openPositions.map((position, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="hover:shadow-lg transition-all duration-300 group border-0">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {position.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {position.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {position.location}
                          </span>
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                            {position.type}
                          </span>
                        </div>
                      </div>
                      <Button className="shrink-0">Apply Now</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {position.description}
                    </p>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        Requirements:
                      </h4>
                      <ul className="space-y-1">
                        {position.requirements.map((req, reqIndex) => (
                          <li
                            key={reqIndex}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-primary-foreground"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Don't See Your Role?
          </h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            We're always looking for exceptional talent. Send us your resume and
            tell us how you'd like to contribute to the future of finance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-4 text-lg"
              asChild
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <a href="mailto:careers@abubeast.com">Send Resume</a>
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
