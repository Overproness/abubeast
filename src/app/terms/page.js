"use client";

import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  Scale,
  Shield,
  Users,
  XCircle,
} from "lucide-react";

export default function TermsOfServicePage() {
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

  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: <CheckCircle className="w-6 h-6" />,
      content: `By accessing and using AbuBeast's trading platform and services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and AbuBeast. If you do not agree to these terms, please do not use our services.

Our platform provides cryptocurrency trading tools, analytics, and educational resources. By using our services, you confirm that you are at least 18 years old and have the legal capacity to enter into this agreement.`,
    },
    {
      title: "2. Platform Services",
      icon: <Globe className="w-6 h-6" />,
      content: `AbuBeast provides a comprehensive cryptocurrency trading platform that includes:

• Real-time market data and price feeds
• Advanced trading tools and analytics
• Portfolio management and tracking
• Educational resources and market insights
• Wallet integration and transaction monitoring
• Community features and social trading
• Risk management tools and alerts

Our services are provided "as is" and we reserve the right to modify, suspend, or discontinue any part of our platform at any time with reasonable notice.`,
    },
    {
      title: "3. User Responsibilities",
      icon: <Users className="w-6 h-6" />,
      content: `As a user of our platform, you agree to:

• Provide accurate and complete information during registration
• Maintain the confidentiality of your account credentials
• Use the platform in compliance with all applicable laws and regulations
• Not engage in any fraudulent, abusive, or illegal activities
• Not attempt to manipulate markets or engage in wash trading
• Respect intellectual property rights and not reverse engineer our software
• Report any security vulnerabilities or suspicious activities
• Keep your contact information and  up to date

You are solely responsible for all activities that occur under your account and for maintaining the security of your login credentials.`,
    },
    {
      title: "4. Trading Risks and Disclaimers",
      icon: <AlertCircle className="w-6 h-6" />,
      content: `Cryptocurrency trading involves substantial risk and may not be suitable for all users. By using our platform, you acknowledge and accept the following risks:

• High volatility and potential for significant losses
• Market manipulation and lack of regulation in some jurisdictions
• Technical failures that may result in trading losses
• Liquidity risks and slippage during high-volume periods
• Counterparty risks when using third-party services
• Regulatory changes that may affect trading activities

AbuBeast does not provide investment advice and our tools are for informational purposes only. You should conduct your own research and consider consulting with financial advisors before making trading decisions.`,
    },
    {
      title: "5. Prohibited Activities",
      icon: <XCircle className="w-6 h-6" />,
      content: `The following activities are strictly prohibited on our platform:

• Money laundering or financing of illegal activities
• Market manipulation, spoofing, or wash trading
• Creating multiple accounts to circumvent restrictions
• Using automated trading systems without proper authorization
• Sharing or selling account access to third parties
• Attempting to hack, disrupt, or compromise platform security
• Violating any applicable local, state, or international laws
• Engaging in harassment or abusive behavior toward other users
• Spreading false information or manipulating market sentiment

Violation of these terms may result in immediate account suspension or termination and potential legal action.`,
    },
    {
      title: "6. Intellectual Property",
      icon: <Shield className="w-6 h-6" />,
      content: `AbuBeast retains all rights, title, and interest in our platform, including:

• Software, algorithms, and trading tools
• User interface design and user experience
• Data analytics and market insights
• Educational content and research materials
• Trademarks, logos, and brand assets

Users are granted a limited, non-exclusive, non-transferable license to use our platform for personal trading activities. This license does not include the right to:

• Reproduce, distribute, or create derivative works
• Reverse engineer or decompile our software
• Use our intellectual property for commercial purposes without written consent
• Remove or modify any proprietary notices or labels`,
    },
    {
      title: "7. Privacy and Data Protection",
      icon: <FileText className="w-6 h-6" />,
      content: `We are committed to protecting your privacy and handling your personal data responsibly. Our data practices include:

• Collecting only necessary information for platform operation
• Implementing industry-standard security measures
• Never selling personal data to third parties
• Providing transparency about data usage and retention
• Complying with applicable privacy regulations (GDPR, CCPA, etc.)
• Offering users control over their personal information

For detailed information about our data practices, please review our Privacy Policy, which is incorporated by reference into these Terms of Service.`,
    },
    {
      title: "8. Account Termination",
      icon: <Clock className="w-6 h-6" />,
      content: `Either party may terminate the user agreement under the following circumstances:

User-initiated termination:
• You may close your account at any time through your account settings
• You must ensure all open positions are closed before termination
• Any remaining funds should be withdrawn according to our procedures

Platform-initiated termination:
• Violation of these Terms of Service
• Suspected fraudulent or illegal activity
• Extended period of account inactivity
• Regulatory or legal requirements

Upon termination, your access to the platform will be revoked, but certain provisions of these terms will survive, including intellectual property rights and limitation of liability clauses.`,
    },
    {
      title: "9. Limitation of Liability",
      icon: <Scale className="w-6 h-6" />,
      content: `To the maximum extent permitted by law, AbuBeast's liability is limited as follows:

• We are not liable for trading losses or missed opportunities
• Our total liability will not exceed the fees paid by you in the preceding 12 months
• We are not responsible for third-party service failures or market conditions
• We disclaim all warranties, express or implied, including merchantability
• We are not liable for indirect, incidental, or consequential damages

This limitation applies regardless of the theory of liability, whether in contract, tort, or otherwise. Some jurisdictions do not allow limitations on implied warranties or liability, so these limitations may not apply to you.`,
    },
    {
      title: "10. Governing Law and Dispute Resolution",
      icon: <Scale className="w-6 h-6" />,
      content: `These Terms of Service are governed by the laws of [Jurisdiction] without regard to conflict of law principles. Any disputes arising from these terms or your use of our platform will be resolved through:

• Good faith negotiation as the first step
• Binding arbitration if negotiation fails
• Individual claims only (no class actions)
• Arbitration conducted under [Arbitration Rules]

You agree to waive any right to a jury trial and to resolve disputes on an individual basis. This dispute resolution clause survives termination of the user agreement.`,
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
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
            className={`absolute inset-0 ${isDarkMode
                ? "bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-gray-900/40"
                : "bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-indigo-100/50"
              }`}
          />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={fadeInUp} className="flex justify-center mb-8">
            <div
              className={`p-4 rounded-2xl ${isDarkMode
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-white/80 border border-gray-200 shadow-lg"
                }`}
            >
              <FileText
                className={`w-12 h-12 ${isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}
              />
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className={`text-5xl lg:text-7xl font-bold mb-6 ${isDarkMode
                ? "bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
              }`}
          >
            Terms of Service
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className={`text-xl lg:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
          >
            Legal terms and conditions governing your use of the AbuBeast
            trading platform. Please read these terms carefully before using our
            services.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium ${isDarkMode
                ? "bg-gray-800/50 text-gray-300 border border-gray-700"
                : "bg-white/80 text-gray-600 border border-gray-200 shadow-sm"
              }`}
          >
            <Clock className="w-4 h-4" />
            Last updated: December 2024
          </motion.div>
        </div>
      </motion.div>

      {/* Content Section */}
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
              className={`p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl ${isDarkMode
                  ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
                  : "bg-white/80 border-gray-200 hover:bg-white shadow-lg"
                }`}
            >
              <div className="flex items-start gap-6">
                <div
                  className={`flex-shrink-0 p-3 rounded-2xl ${isDarkMode
                      ? "bg-blue-900/30 text-blue-400"
                      : "bg-blue-100 text-blue-600"
                    }`}
                >
                  {section.icon}
                </div>

                <div className="flex-1">
                  <h2
                    className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                  >
                    {section.title}
                  </h2>

                  <div
                    className={`text-lg leading-relaxed whitespace-pre-line ${isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                  >
                    {section.content}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className={`mt-16 p-8 rounded-3xl border text-center ${isDarkMode
              ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-gray-700"
              : "bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200"
            }`}
        >
          <h3
            className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"
              }`}
          >
            Questions About These Terms?
          </h3>

          <p
            className={`text-lg mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
          >
            If you have any questions about these Terms of Service, please don't
            hesitate to contact us.
          </p>

          <motion.a
            href="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
              }`}
          >
            Contact Support
            <Users className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}
