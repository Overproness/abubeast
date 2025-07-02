"use client";

import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Eye,
  FileText,
  Globe,
  Lock,
  Shield,
  Users,
} from "lucide-react";

export default function GDPRPage() {
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

  const rights = [
    {
      title: "Right to Access",
      icon: <Eye className="w-6 h-6" />,
      description:
        "You have the right to request a copy of all personal data we hold about you.",
      action:
        "Request your data through your account settings or contact support.",
    },
    {
      title: "Right to Rectification",
      icon: <FileText className="w-6 h-6" />,
      description:
        "You can request corrections to any inaccurate or incomplete personal data.",
      action:
        "Update your profile information directly or contact our support team.",
    },
    {
      title: "Right to Erasure",
      icon: <AlertTriangle className="w-6 h-6" />,
      description:
        "You can request deletion of your personal data under certain circumstances.",
      action:
        "Submit a deletion request through your account settings or contact support.",
    },
    {
      title: "Right to Portability",
      icon: <Database className="w-6 h-6" />,
      description:
        "You can request your data in a machine-readable format for transfer.",
      action:
        "Export your data through account settings or request assistance from support.",
    },
    {
      title: "Right to Object",
      icon: <Shield className="w-6 h-6" />,
      description:
        "You can object to processing of your data for marketing or profiling purposes.",
      action:
        "Opt out through privacy settings or contact us to discuss your objections.",
    },
    {
      title: "Right to Restrict Processing",
      icon: <Lock className="w-6 h-6" />,
      description:
        "You can request restriction of processing under specific circumstances.",
      action:
        "Contact our Data Protection Officer to discuss restriction requests.",
    },
  ];

  const sections = [
    {
      title: "Our Commitment to GDPR Compliance",
      icon: <Shield className="w-6 h-6" />,
      content: `At AbuBeast, we are committed to protecting your privacy and complying with the General Data Protection Regulation (GDPR). As a cryptocurrency trading platform serving users across the European Union and globally, we take our data protection responsibilities seriously.

The GDPR grants you specific rights regarding your personal data and requires us to be transparent about how we collect, use, and protect your information. This page outlines your rights under GDPR and explains how we ensure compliance with these important privacy regulations.

We have implemented comprehensive technical and organizational measures to protect your personal data, including data encryption, access controls, regular security audits, and staff training on data protection principles. Our commitment extends beyond mere compliance to building trust through privacy-by-design practices.`,
    },
    {
      title: "Legal Basis for Data Processing",
      icon: <FileText className="w-6 h-6" />,
      content: `We process your personal data only when we have a valid legal basis under GDPR. Our primary legal bases include:

Contractual Necessity: We process data necessary to provide our trading services, maintain your account, execute trades, and fulfill our contractual obligations to you. This includes identity verification, transaction processing, and customer support.

Legitimate Interest: We may process data for legitimate business interests, such as fraud prevention, security monitoring, platform optimization, and compliance with financial regulations. We always balance these interests against your privacy rights.

Legal Obligation: We process certain data to comply with legal requirements, including anti-money laundering (AML) regulations, tax reporting obligations, and financial services compliance requirements.

Consent: For non-essential processing activities, such as marketing communications or certain analytics, we obtain your explicit consent. You can withdraw this consent at any time through your account settings.

We regularly review our data processing activities to ensure they remain necessary, proportionate, and compliant with GDPR requirements.`,
    },
    {
      title: "Data Categories and Retention",
      icon: <Database className="w-6 h-6" />,
      content: `We collect and process different categories of personal data for specific purposes:

Identity and Contact Information:
• Name, email address, phone number, postal address
• Government-issued ID documents for verification
• Retained for the duration of your account plus 7 years for regulatory compliance

Financial and Trading Data:
• Bank account details, payment method information
• Trading history, transaction records, portfolio data
• Retained for 7 years after account closure for regulatory and tax purposes

Technical and Usage Data:
• IP addresses, device information, browser data
• Platform usage patterns, feature interactions
• Retained for 2 years or as required for security monitoring

Communication Records:
• Customer support conversations, emails, chat logs
• Retained for 3 years to maintain service quality and resolve disputes

We apply data minimization principles, collecting only data necessary for our services, and regularly review retention periods to ensure they remain appropriate and compliant.`,
    },
    {
      title: "International Data Transfers",
      icon: <Globe className="w-6 h-6" />,
      content: `As a global trading platform, we may transfer your personal data to countries outside the European Economic Area (EEA). We ensure all international transfers comply with GDPR requirements through appropriate safeguards:

Adequacy Decisions: When transferring data to countries with adequacy decisions from the European Commission, we rely on these decisions as the legal basis for transfer.

Standard Contractual Clauses (SCCs): For transfers to countries without adequacy decisions, we use the European Commission's Standard Contractual Clauses to ensure appropriate protection of your data.

Binding Corporate Rules: Our group companies operate under binding corporate rules that provide consistent data protection standards across all jurisdictions.

Specific Transfer Scenarios:
• Cloud infrastructure providers with EU data centers and GDPR compliance
• Customer support services with appropriate data processing agreements
• Regulatory reporting to financial authorities as required by law
• Third-party service providers with strong privacy and security commitments

We regularly assess the privacy landscape in destination countries and update our transfer mechanisms as needed to maintain compliance.`,
    },
    {
      title: "Data Security and Breach Response",
      icon: <Lock className="w-6 h-6" />,
      content: `We implement robust security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction:

Technical Safeguards:
• End-to-end encryption for data transmission and storage
• Multi-factor authentication and advanced access controls
• Regular security audits and penetration testing
• Automated monitoring and threat detection systems

Organizational Measures:
• Staff training on data protection and security procedures
• Regular review and updating of security policies
• Incident response procedures and data breach protocols
• Privacy by design principles in system development

Breach Response Protocol:
In the unlikely event of a data breach affecting your personal data, we will:
• Contain and assess the breach within 24 hours
• Notify relevant supervisory authorities within 72 hours if required
• Inform affected individuals without undue delay if there is high risk
• Provide clear information about the breach and mitigation steps
• Conduct thorough investigation and implement additional safeguards

We maintain detailed logs and documentation to demonstrate compliance with GDPR security requirements and continuously improve our security posture.`,
    },
    {
      title: "Exercising Your Rights",
      icon: <CheckCircle className="w-6 h-6" />,
      content: `You can exercise your GDPR rights through multiple channels:

Self-Service Options:
• Account Settings: Update personal information, privacy preferences, and communication settings
• Data Export: Download your trading history, transaction records, and account data
• Privacy Dashboard: View data processing activities and manage consent preferences

Contact Methods:
• Email our Data Protection Officer at privacy@abubeast.com
• Submit requests through our secure support portal
• Contact customer support with "GDPR Request" in the subject line
• Write to our legal team at the address provided in our contact information

Response Timeline:
• We respond to most requests within 5 business days
• Complex requests may take up to 30 days (with notification)
• We may request additional verification for security purposes
• No fee is charged for reasonable requests

Important Considerations:
• Some data may be retained for legal or regulatory compliance
• Erasure requests may affect your ability to use certain platform features
• We balance your rights with legitimate interests and legal obligations
• Appeals process available through supervisory authorities if needed`,
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
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
            className={`absolute inset-0 ${
              isDarkMode
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
              className={`p-4 rounded-2xl ${
                isDarkMode
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-white/80 border border-gray-200 shadow-lg"
              }`}
            >
              <Shield
                className={`w-12 h-12 ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className={`text-5xl lg:text-7xl font-bold mb-6 ${
              isDarkMode
                ? "bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
            }`}
          >
            GDPR Compliance
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className={`text-xl lg:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Your privacy rights under the General Data Protection Regulation.
            Learn how we protect your data and how you can exercise your rights.
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
            Effective: May 25, 2018 | Last updated: December 2024
          </motion.div>
        </div>
      </motion.div>

      {/* Rights Section */}
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
            Your GDPR Rights
          </h2>
          <p
            className={`text-lg text-center max-w-3xl mx-auto mb-12 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Under GDPR, you have several fundamental rights regarding your
            personal data
          </p>
        </motion.div>

        <motion.div
          className="grid lg:grid-cols-2 gap-8 mb-16"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {rights.map((right, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className={`p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl ${
                isDarkMode
                  ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
                  : "bg-white/80 border-gray-200 hover:bg-white shadow-lg"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`p-3 rounded-2xl ${
                    isDarkMode
                      ? "bg-blue-900/30 text-blue-400"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {right.icon}
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {right.title}
                  </h3>
                  <p
                    className={`text-base mb-4 leading-relaxed ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {right.description}
                  </p>
                  <div
                    className={`text-sm font-medium p-3 rounded-xl ${
                      isDarkMode
                        ? "bg-gray-700/50 text-gray-200"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <strong>How to exercise:</strong> {right.action}
                  </div>
                </div>
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
                      ? "bg-blue-900/30 text-blue-400"
                      : "bg-blue-100 text-blue-600"
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

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className={`mt-16 p-8 rounded-3xl border text-center ${
            isDarkMode
              ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-gray-700"
              : "bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200"
          }`}
        >
          <div className="flex justify-center mb-6">
            <div
              className={`p-4 rounded-2xl ${
                isDarkMode
                  ? "bg-blue-900/30 text-blue-400"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <Users className="w-8 h-8" />
            </div>
          </div>

          <h3
            className={`text-2xl font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Need Help with Your Data Rights?
          </h3>

          <p
            className={`text-lg mb-6 max-w-2xl mx-auto ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Our Data Protection Officer is here to help you understand and
            exercise your GDPR rights. Contact us for assistance with any
            privacy-related questions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="mailto:privacy@abubeast.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
              }`}
            >
              <Shield className="w-5 h-5" />
              Contact DPO
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
              General Support
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
