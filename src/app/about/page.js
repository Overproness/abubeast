import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
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
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                <Target className="h-4 w-4 mr-2" />
                Our Mission
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Empowering the{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Next Generation
                </span>{" "}
                of Traders
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                At AbuBeast, we believe that everyone deserves access to
                professional-grade trading tools. Our platform bridges the gap
                between traditional finance and the emerging crypto economy,
                providing institutional-quality features in a user-friendly
                interface.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Security First
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Bank-grade security with multi-layer protection systems
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Lightning Fast
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Sub-second trade execution with 99.9% uptime guarantee
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      User-Centric
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Designed with traders' needs at the center of everything
                      we do
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-[500px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl backdrop-blur-sm flex items-center justify-center">
                <div className="text-8xl">🚀</div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-3xl animate-bounce">
                ⭐
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-2xl text-white animate-pulse">
                💎
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Achievements
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Numbers that speak to our commitment to excellence and our users'
              success
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <Card
                key={index}
                className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-8">
                  <achievement.icon className="h-12 w-12 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    {achievement.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our{" "}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Journey
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From a small startup to a global trading platform trusted by
              thousands
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200 dark:bg-blue-800"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`w-1/2 ${
                      index % 2 === 0 ? "pr-8 text-right" : "pl-8"
                    }`}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {milestone.year}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="relative z-10 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900 shadow-lg"></div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Core{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Values
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              These principles guide everything we do and shape our company
              culture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ValueCard
              icon={<Shield className="h-12 w-12 text-blue-500" />}
              title="Security & Trust"
              description="We implement military-grade security measures and operate with complete transparency to earn and maintain your trust every day."
              gradient="from-blue-500 to-cyan-500"
            />
            <ValueCard
              icon={<Users className="h-12 w-12 text-green-500" />}
              title="User Empowerment"
              description="We believe in democratizing access to professional trading tools, empowering users of all experience levels to succeed."
              gradient="from-green-500 to-emerald-500"
            />
            <ValueCard
              icon={<Award className="h-12 w-12 text-purple-500" />}
              title="Excellence"
              description="We pursue excellence in every aspect of our platform, from cutting-edge technology to exceptional customer service."
              gradient="from-purple-500 to-violet-500"
            />
            <ValueCard
              icon={<Clock className="h-12 w-12 text-red-500" />}
              title="Reliability"
              description="Our platform is built for 99.9% uptime with redundant systems ensuring you can trade whenever opportunities arise."
              gradient="from-red-500 to-pink-500"
            />
            <ValueCard
              icon={<Globe className="h-12 w-12 text-indigo-500" />}
              title="Global Vision"
              description="We embrace diversity and build solutions that serve traders from all backgrounds, cultures, and regions worldwide."
              gradient="from-indigo-500 to-blue-500"
            />
            <ValueCard
              icon={<CheckCircle className="h-12 w-12 text-teal-500" />}
              title="Integrity"
              description="We operate with honesty and transparency, building lasting relationships through ethical practices and open communication."
              gradient="from-teal-500 to-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Leadership{" "}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Team
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Meet the visionary leaders driving AbuBeast forward
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <TeamMember
              name="Alexander Wright"
              role="CEO & Co-Founder"
              description="Former Goldman Sachs VP with 15+ years in financial markets"
              image="/images/team/ceo.jpg"
              linkedin="#"
              twitter="#"
            />
            <TeamMember
              name="Sophia Chen"
              role="CTO & Co-Founder"
              description="Ex-Google engineer specializing in high-frequency trading systems"
              image="/images/team/cto.jpg"
              linkedin="#"
              twitter="#"
            />
            <TeamMember
              name="Marcus Johnson"
              role="Head of Product"
              description="Product strategist from Apple with expertise in fintech UX"
              image="/images/team/product.jpg"
              linkedin="#"
              twitter="#"
            />
            <TeamMember
              name="Elena Rodriguez"
              role="Chief Security Officer"
              description="Cybersecurity expert from the NSA with blockchain specialization"
              image="/images/team/security.jpg"
              linkedin="#"
              twitter="#"
            />
          </div>

          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Want to join our growing team?
            </p>
            <Button size="lg" asChild>
              <Link href="/careers">View Open Positions</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to Join the{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Revolution?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
            Experience the future of crypto trading today. Join thousands of
            traders who have already chosen AbuBeast as their preferred trading
            platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button
              size="lg"
              className="px-12 py-6 text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
              asChild
            >
              <Link href="/auth/signup">Start Trading Now</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-12 py-6 text-lg border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
              asChild
            >
              <Link href="/features">Explore Features</Link>
            </Button>
          </div>
          <div className="mt-12 text-blue-100">
            <p className="text-sm mb-4">
              Join the community that's shaping the future of finance
            </p>
            <div className="flex justify-center items-center gap-8 opacity-80 text-sm">
              <span>🚀 50,000+ Active Users</span>
              <span>💰 $2.5B+ Trading Volume</span>
              <span>🌍 Available in 50+ Countries</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ValueCard({ icon, title, description, gradient }) {
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
      <CardContent className="p-8 relative">
        <div
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full transform translate-x-8 -translate-y-8`}
        ></div>
        <div className="relative">
          <div className="mb-6 group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMember({ name, role, description, image, linkedin, twitter }) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0">
      <CardContent className="p-6 text-center">
        <div className="mb-6 relative h-48 w-full rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 to-purple-900">
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            👤
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {name}
        </h3>
        <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
          {role}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {description}
        </p>
        <div className="flex justify-center space-x-3">
          <a
            href={linkedin}
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href={twitter}
            className="text-gray-400 hover:text-blue-400 transition-colors"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
