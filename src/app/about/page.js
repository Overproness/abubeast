"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { motion } from "framer-motion";
import {
  Award,
  CheckCircle,
  Clock,
  Globe,
  Heart,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6 },
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
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

const scaleOnHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2 },
};

export default function AboutPage() {
  const milestones = [
    {
      year: "2021",
      title: "Company Founded",
      description:
        "AbuBeast was born from a vision to democratize crypto trading",
    },
    {
      year: "2022",
      title: "Platform Launch",
      description: "Launched our MVP with core trading features",
    },
    {
      year: "2023",
      title: "Global Expansion",
      description: "Expanded to serve users in 50+ countries",
    },
    {
      year: "2024",
      title: "Advanced Features",
      description: "Introduced AI-powered trading tools and DeFi integration",
    },
  ];

  const achievements = [
    { number: "50K+", label: "Active Traders", icon: Users },
    { number: "$2.5B+", label: "Trading Volume", icon: TrendingUp },
    { number: "99.9%", label: "Uptime", icon: Clock },
    { number: "50+", label: "Countries", icon: Globe },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <PageHeader
        title="About AbuBeast"
        subtitle="Pioneering the future of cryptocurrency trading"
        description="We're on a mission to make crypto trading accessible, secure, and profitable for everyone, from beginners to institutional traders."
        gradient
        animatedBlobs
        size="large"
      >
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button size="lg" asChild className="px-8 py-4 text-lg">
            <Link href="/auth/signup">Join Our Platform</Link>
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

      {/* Our Mission Section */}
      <motion.section
        className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Target className="h-4 w-4 mr-2" />
                Our Mission
              </motion.div>
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Empowering the{" "}
                <motion.span
                  className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  Next Generation
                </motion.span>{" "}
                of Traders
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                At AbuBeast, we believe that everyone deserves access to
                professional-grade trading tools. Our platform bridges the gap
                between traditional finance and the emerging crypto economy,
                providing institutional-quality features in a user-friendly
                interface.
              </motion.p>
              <motion.div
                className="space-y-6"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <motion.div
                  className="flex items-start space-x-4"
                  variants={fadeInLeft}
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Security First
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Bank-grade security with multi-layer protection systems
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-start space-x-4"
                  variants={fadeInLeft}
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 10px 30px rgba(34, 197, 94, 0.3)",
                    }}
                  >
                    <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Lightning Fast
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Sub-second trade execution with 99.9% uptime guarantee
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-start space-x-4"
                  variants={fadeInLeft}
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 10px 30px rgba(147, 51, 234, 0.3)",
                    }}
                  >
                    <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      User-Centric
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Designed with traders' needs at the center of everything
                      we do
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                className="w-full h-[500px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl backdrop-blur-sm flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(59, 130, 246, 0.2)",
                    "0 0 60px rgba(147, 51, 234, 0.2)",
                    "0 0 30px rgba(59, 130, 246, 0.2)",
                  ],
                }}
              >
                <motion.div
                  className="text-8xl"
                  animate={{
                    rotateY: [0, 15, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🚀
                </motion.div>
              </motion.div>
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-3xl"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ⭐
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-2xl text-white"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                💎
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Achievements Section */}
      <motion.section
        className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Our{" "}
              <motion.span
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Achievements
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Numbers that speak to our commitment to excellence and our users'
              success
            </motion.p>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {achievements.map((achievement, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <motion.div
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardContent className="p-8">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{
                          scale: 1.2,
                          rotate: 360,
                        }}
                      >
                        <achievement.icon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      </motion.div>
                      <motion.div
                        className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.1 + 0.2,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        {achievement.number}
                      </motion.div>
                      <motion.div
                        className="text-gray-600 dark:text-gray-300 font-medium"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
                      >
                        {achievement.label}
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Timeline Section */}
      <motion.section
        className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Our{" "}
              <motion.span
                className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Journey
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              From a small startup to a global trading platform trusted by
              thousands
            </motion.p>
          </motion.div>
          <div className="relative">
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200 dark:bg-blue-800"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              style={{ originY: 0 }}
            />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <div
                    className={`w-1/2 ${
                      index % 2 === 0 ? "pr-8 text-right" : "pl-8"
                    }`}
                  >
                    <motion.div
                      whileHover={{
                        y: -10,
                        transition: { duration: 0.3 },
                      }}
                    >
                      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-6">
                          <motion.div
                            className="text-2xl font-bold text-blue-600 mb-2"
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.5,
                              delay: index * 0.2 + 0.3,
                              type: "spring",
                              stiffness: 200,
                            }}
                          >
                            {milestone.year}
                          </motion.div>
                          <motion.h3
                            className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.5,
                              delay: index * 0.2 + 0.5,
                            }}
                          >
                            {milestone.title}
                          </motion.h3>
                          <motion.p
                            className="text-gray-600 dark:text-gray-300"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.5,
                              delay: index * 0.2 + 0.7,
                            }}
                          >
                            {milestone.description}
                          </motion.p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                  <motion.div
                    className="relative z-10 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900 shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.2 + 0.8,
                      type: "spring",
                      stiffness: 200,
                    }}
                    whileHover={{
                      scale: 1.5,
                      boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                    }}
                  />
                  <div className="w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section
        className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Our Core{" "}
              <motion.span
                className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Values
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              These principles guide everything we do and shape our company
              culture
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <ValueCard
                icon={<Shield className="h-12 w-12 text-blue-500" />}
                title="Security & Trust"
                description="We implement military-grade security measures and operate with complete transparency to earn and maintain your trust every day."
                gradient="from-blue-500 to-cyan-500"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <ValueCard
                icon={<Users className="h-12 w-12 text-green-500" />}
                title="User Empowerment"
                description="We believe in democratizing access to professional trading tools, empowering users of all experience levels to succeed."
                gradient="from-green-500 to-emerald-500"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <ValueCard
                icon={<Award className="h-12 w-12 text-purple-500" />}
                title="Excellence"
                description="We pursue excellence in every aspect of our platform, from cutting-edge technology to exceptional customer service."
                gradient="from-purple-500 to-violet-500"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <ValueCard
                icon={<Clock className="h-12 w-12 text-red-500" />}
                title="Reliability"
                description="Our platform is built for 99.9% uptime with redundant systems ensuring you can trade whenever opportunities arise."
                gradient="from-red-500 to-pink-500"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <ValueCard
                icon={<Globe className="h-12 w-12 text-indigo-500" />}
                title="Global Vision"
                description="We embrace diversity and build solutions that serve traders from all backgrounds, cultures, and regions worldwide."
                gradient="from-indigo-500 to-blue-500"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <ValueCard
                icon={<CheckCircle className="h-12 w-12 text-teal-500" />}
                title="Integrity"
                description="We operate with honesty and transparency, building lasting relationships through ethical practices and open communication."
                gradient="from-teal-500 to-cyan-500"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Leadership Team Section */}
      <motion.section
        className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Leadership{" "}
              <motion.span
                className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Team
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Meet the visionary leaders driving AbuBeast forward
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <TeamMember
                name="Alexander Wright"
                role="CEO & Co-Founder"
                description="Former Goldman Sachs VP with 15+ years in financial markets"
                image="/images/team/ceo.jpg"
                linkedin="#"
                twitter="#"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <TeamMember
                name="Sophia Chen"
                role="CTO & Co-Founder"
                description="Ex-Google engineer specializing in high-frequency trading systems"
                image="/images/team/cto.jpg"
                linkedin="#"
                twitter="#"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <TeamMember
                name="Marcus Johnson"
                role="Head of Product"
                description="Product strategist from Apple with expertise in fintech UX"
                image="/images/team/product.jpg"
                linkedin="#"
                twitter="#"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <TeamMember
                name="Elena Rodriguez"
                role="Chief Security Officer"
                description="Cybersecurity expert from the NSA with blockchain specialization"
                image="/images/team/security.jpg"
                linkedin="#"
                twitter="#"
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.p
              className="text-lg text-gray-600 dark:text-gray-300 mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              Want to join our growing team?
            </motion.p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" asChild>
                <Link href="/careers">View Open Positions</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Join Us CTA */}
      <motion.section
        className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        />
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Join the{" "}
            <motion.span
              className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              Revolution?
            </motion.span>
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Experience the future of crypto trading today. Join thousands of
            traders who have already chosen AbuBeast as their preferred trading
            platform.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                y: -5,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="px-12 py-6 text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transform transition-all duration-200"
                asChild
              >
                <Link href="/auth/signup">Start Trading Now</Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{
                scale: 1.05,
                y: -5,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="px-12 py-6 text-lg border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
                asChild
              >
                <Link href="/features">Explore Features</Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            className="mt-12 text-blue-100"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.p
              className="text-sm mb-4"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              Join the community that's shaping the future of finance
            </motion.p>
            <motion.div
              className="flex justify-center items-center gap-8 opacity-80 text-sm"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.span
                variants={fadeInUp}
                whileHover={{ scale: 1.1, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                🚀 50,000+ Active Users
              </motion.span>
              <motion.span
                variants={fadeInUp}
                whileHover={{ scale: 1.1, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                💰 $2.5B+ Trading Volume
              </motion.span>
              <motion.span
                variants={fadeInUp}
                whileHover={{ scale: 1.1, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                🌍 Available in 50+ Countries
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}

function ValueCard({ icon, title, description, gradient }) {
  return (
    <motion.div
      whileHover={{
        y: -10,
        transition: { duration: 0.3 },
      }}
    >
      <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        <CardContent className="p-8 relative">
          <motion.div
            className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full transform translate-x-8 -translate-y-8`}
            animate={{
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <div className="relative">
            <motion.div
              className="mb-6"
              whileHover={{
                scale: 1.2,
                rotate: [0, -10, 10, 0],
              }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>
            <motion.h3
              className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {title}
            </motion.h3>
            <motion.p
              className="text-gray-600 dark:text-gray-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {description}
            </motion.p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TeamMember({ name, role, description, image, linkedin, twitter }) {
  return (
    <motion.div
      whileHover={{
        y: -10,
        transition: { duration: 0.3 },
      }}
    >
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
        <CardContent className="p-6 text-center">
          <motion.div
            className="mb-6 relative h-48 w-full rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 to-purple-900"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-6xl"
              whileHover={{
                rotate: [0, -10, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 0.5 }}
            >
              👤
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
          </motion.div>
          <motion.h3
            className="text-xl font-bold text-gray-900 dark:text-white mb-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {name}
          </motion.h3>
          <motion.p
            className="text-blue-600 dark:text-blue-400 font-medium mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {role}
          </motion.p>
          <motion.p
            className="text-sm text-gray-600 dark:text-gray-300 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {description}
          </motion.p>
          <motion.div
            className="flex justify-center space-x-3"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.a
              href={linkedin}
              className="text-gray-400 hover:text-blue-600 transition-colors"
              whileHover={{
                scale: 1.3,
                rotate: 10,
              }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </motion.a>
            <motion.a
              href={twitter}
              className="text-gray-400 hover:text-blue-400 transition-colors"
              whileHover={{
                scale: 1.3,
                rotate: -10,
              }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </motion.a>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
