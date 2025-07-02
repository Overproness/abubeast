"use client";

import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Cookie,
  Globe,
  Info,
  Settings,
  Shield,
  Users,
} from "lucide-react";

export default function CookiePolicyPage() {
  const { isDarkMode } = useTheme();

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

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const cookieTypes = [
    {
      title: "Essential Cookies",
      icon: <Shield className="w-6 h-6" />,
      status: "Always Active",
      color: "green",
      description:
        "These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you.",
      examples: [
        "User authentication and session management",
        "Security and fraud prevention",
        "Load balancing and website functionality",
        "Language and accessibility preferences",
      ],
    },
    {
      title: "Analytics Cookies",
      icon: <Info className="w-6 h-6" />,
      status: "Optional",
      color: "blue",
      description:
        "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
      examples: [
        "Page views and user navigation patterns",
        "Feature usage and performance metrics",
        "Error tracking and debugging information",
        "A/B testing and optimization data",
      ],
    },
    {
      title: "Functional Cookies",
      icon: <Settings className="w-6 h-6" />,
      status: "Optional",
      color: "purple",
      description:
        "These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.",
      examples: [
        "Dark mode and theme preferences",
        "Dashboard layout and customizations",
        "Trading pair preferences",
        "Notification settings and alerts",
      ],
    },
    {
      title: "Marketing Cookies",
      icon: <Globe className="w-6 h-6" />,
      status: "Optional",
      color: "orange",
      description:
        "These cookies track your activity across websites to help advertisers deliver more relevant advertising to you.",
      examples: [
        "Social media integration and sharing",
        "Targeted advertising and remarketing",
        "Campaign performance tracking",
        "Third-party analytics and attribution",
      ],
    },
  ];

  const sections = [
    {
      title: "What Are Cookies?",
      icon: <Cookie className="w-6 h-6" />,
      content: `Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and provide a better user experience. Cookies help websites remember information about your visit, such as your preferred settings and login status.

At AbuBeast, we use cookies to enhance your trading experience, improve our platform's performance, and ensure the security of your account. This Cookie Policy explains what cookies we use, why we use them, and how you can manage your cookie preferences.

Cookies cannot access your personal files or install software on your device. They are simply small pieces of data that help us provide you with a better service.`,
    },
    {
      title: "How We Use Cookies",
      icon: <CheckCircle className="w-6 h-6" />,
      content: `We use cookies for several important purposes on our trading platform:

Security and Authentication: Essential cookies help us verify your identity and maintain secure login sessions. These cookies protect your account from unauthorized access and ensure that sensitive trading operations are performed securely.

Platform Functionality: Functional cookies remember your preferences, such as your preferred trading pairs, chart settings, dashboard layout, and theme preferences. This allows us to provide a personalized experience every time you visit.

Performance Optimization: Analytics cookies help us understand how users interact with our platform, which features are most popular, and where improvements can be made. This data is crucial for optimizing platform performance and user experience.

Compliance and Monitoring: We use cookies to ensure compliance with trading regulations and to monitor for suspicious activities that could indicate fraud or market manipulation.`,
    },
    {
      title: "Cookie Duration and Storage",
      icon: <Clock className="w-6 h-6" />,
      content: `We use different types of cookies based on how long they are stored on your device:

Session Cookies: These temporary cookies are deleted when you close your browser. They are essential for maintaining your login session and ensuring secure navigation through the platform during your visit.

Persistent Cookies: These cookies remain on your device for a specified period or until you delete them. They help us remember your preferences and provide a consistent experience across multiple visits.

Storage Duration:
• Essential cookies: Duration of your session or up to 30 days
• Functional cookies: Up to 1 year
• Analytics cookies: Up to 2 years
• Marketing cookies: Up to 2 years (if enabled)

You can view and manage all cookies stored by our website through your browser's developer tools or cookie management settings.`,
    },
    {
      title: "Third-Party Cookies",
      icon: <Globe className="w-6 h-6" />,
      content: `Our platform may include third-party services that set their own cookies. These services are carefully selected and vetted for security and privacy compliance:

Analytics Services: We use analytics tools to understand user behavior and improve our platform. These services may set cookies to track page views, user journeys, and feature usage.

Social Media Integration: If you choose to share content or connect social media accounts, those platforms may set their own cookies according to their privacy policies.

Customer Support: Our customer support tools may use cookies to maintain conversation history and provide better assistance.

Payment Processing: Secure payment processors may set cookies for fraud prevention and transaction security.

We regularly review our third-party integrations to ensure they meet our privacy and security standards. You can opt out of most third-party cookies through your browser settings or the respective service's privacy controls.`,
    },
    {
      title: "Managing Your Cookie Preferences",
      icon: <Settings className="w-6 h-6" />,
      content: `You have full control over how cookies are used on our platform. Here are several ways to manage your cookie preferences:

Browser Settings: All modern browsers allow you to control cookies through their settings. You can choose to block all cookies, allow only first-party cookies, or receive notifications when cookies are set.

Platform Cookie Settings: You can access our cookie preference center through your account settings to enable or disable specific categories of cookies. Your choices will be saved and respected across all your future visits.

Opt-Out Tools: For marketing and analytics cookies, you can use industry opt-out tools and browser extensions that prevent tracking across multiple websites.

Important Note: Disabling essential cookies may affect the functionality of our trading platform. Features such as login, trade execution, and account security may not work properly without these necessary cookies.

If you have any questions about managing your cookie preferences, our support team is available to assist you through our contact page.`,
    },
  ];

  const getStatusColor = (color) => {
    const colors = {
      green: isDarkMode
        ? "text-green-400 bg-green-900/30"
        : "text-green-600 bg-green-100",
      blue: isDarkMode
        ? "text-blue-400 bg-blue-900/30"
        : "text-blue-600 bg-blue-100",
      purple: isDarkMode
        ? "text-purple-400 bg-purple-900/30"
        : "text-purple-600 bg-purple-100",
      orange: isDarkMode
        ? "text-orange-400 bg-orange-900/30"
        : "text-orange-600 bg-orange-100",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-orange-50 via-white to-yellow-50"
      }`}
    >
      {/* Header Section */}
      <motion.div
        className="relative py-20 lg:py-32"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute inset-0 ${
              isDarkMode
                ? "bg-gradient-to-br from-orange-900/20 via-yellow-900/20 to-gray-900/40"
                : "bg-gradient-to-br from-orange-100/50 via-yellow-100/50 to-amber-100/50"
            }`}
          />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={fadeInUp} className="flex justify-center mb-8">
            <div
              className={`p-4 rounded-2xl ${
                isDarkMode
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-white/80 border border-gray-200 shadow-lg"
              }`}
            >
              <Cookie
                className={`w-12 h-12 ${
                  isDarkMode ? "text-orange-400" : "text-orange-600"
                }`}
              />
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className={`text-5xl lg:text-7xl font-bold mb-6 ${
              isDarkMode
                ? "bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-orange-600 via-yellow-600 to-amber-600 bg-clip-text text-transparent"
            }`}
          >
            Cookie Policy
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className={`text-xl lg:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Learn how AbuBeast uses cookies to enhance your trading experience,
            improve platform performance, and protect your account security.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium ${
              isDarkMode
                ? "bg-gray-800/50 text-gray-300 border border-gray-700"
                : "bg-white/80 text-gray-600 border border-gray-200 shadow-sm"
            }`}
          >
            <Clock className="w-4 h-4" />
            Last updated: December 2024
          </motion.div>
        </div>
      </motion.div>

      {/* Cookie Types Section */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2
            className={`text-3xl font-bold text-center mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Types of Cookies We Use
          </h2>
          <p
            className={`text-lg text-center max-w-3xl mx-auto mb-12 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            We use different categories of cookies to provide you with the best
            possible trading experience
          </p>
        </motion.div>

        <motion.div
          className="grid lg:grid-cols-2 gap-8 mb-16"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {cookieTypes.map((type, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className={`p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl ${
                isDarkMode
                  ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
                  : "bg-white/80 border-gray-200 hover:bg-white shadow-lg"
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-2xl ${getStatusColor(type.color)}`}
                  >
                    {type.icon}
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {type.title}
                    </h3>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    type.color
                  )}`}
                >
                  {type.status}
                </span>
              </div>

              <p
                className={`text-base mb-6 leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {type.description}
              </p>

              <div>
                <h4
                  className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Examples:
                </h4>
                <ul className="space-y-2">
                  {type.examples.map((example, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start gap-2 text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-400"
                        }`}
                      />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Detailed Information Section */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          className="space-y-8"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {sections.map((section, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className={`p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl ${
                isDarkMode
                  ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
                  : "bg-white/80 border-gray-200 hover:bg-white shadow-lg"
              }`}
            >
              <div className="flex items-start gap-6">
                <div
                  className={`flex-shrink-0 p-3 rounded-2xl ${
                    isDarkMode
                      ? "bg-orange-900/30 text-orange-400"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {section.icon}
                </div>

                <div className="flex-1">
                  <h2
                    className={`text-2xl font-bold mb-4 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {section.title}
                  </h2>

                  <div
                    className={`text-lg leading-relaxed whitespace-pre-line ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {section.content}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Cookie Settings CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className={`mt-16 p-8 rounded-3xl border text-center ${
            isDarkMode
              ? "bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border-gray-700"
              : "bg-gradient-to-r from-orange-50 to-yellow-50 border-gray-200"
          }`}
        >
          <div className="flex justify-center mb-6">
            <div
              className={`p-4 rounded-2xl ${
                isDarkMode
                  ? "bg-orange-900/30 text-orange-400"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              <Settings className="w-8 h-8" />
            </div>
          </div>

          <h3
            className={`text-2xl font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Manage Your Cookie Preferences
          </h3>

          <p
            className={`text-lg mb-6 max-w-2xl mx-auto ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Take control of your privacy. Customize which cookies you allow and
            update your preferences at any time through your account settings.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/settings"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                isDarkMode
                  ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25"
                  : "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25"
              }`}
            >
              <Settings className="w-5 h-5" />
              Cookie Settings
            </motion.a>

            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold border transition-all duration-300 ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-800/50"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Users className="w-5 h-5" />
              Contact Support
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
