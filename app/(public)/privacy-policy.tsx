import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useI18n } from "@/hooks/useI18n";

export default function PrivacyPolicyPage() {
    usePageTitle("Privacy Policy");
    const { t } = useI18n();

    return (
        <DesktopLayoutWrapper
            showSidebar={false}
            showCartIcon={false}
            showNavBar={true}
            showFooter={true}
        >
            <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                <ScrollView className="flex-1 bg-white">
                    <View className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        {/* Header */}
                        <View className="mb-8">
                            <Text className="text-4xl font-bold text-gray-900 mb-4">
                                Privacy Policy
                            </Text>
                            <Text className="text-sm text-gray-500">
                                Last Updated: November 20, 2024
                            </Text>
                        </View>

                        {/* Introduction */}
                        <View className="mb-8">
                            <Text className="text-base text-gray-700 leading-7">
                                Welcome to our marketplace platform. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our marketplace services.
                            </Text>
                        </View>

                        {/* Section 1 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                1. Information We Collect
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                We collect information that you provide directly to us, including:
                            </Text>
                            <View className="ml-4">
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">Account Information:</Text> Name, email address, phone number, and password when you create an account
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">Profile Information:</Text> Business details for vendors, vehicle information for delivery partners
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">Transaction Information:</Text> Payment details, billing and delivery addresses, purchase history
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">Location Data:</Text> Delivery addresses and real-time location for delivery tracking
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">Communications:</Text> Messages between buyers, vendors, and delivery partners
                                </Text>
                            </View>
                        </View>

                        {/* Section 2 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                2. How We Use Your Information
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                We use the collected information for the following purposes:
                            </Text>
                            <View className="ml-4">
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Facilitate marketplace transactions between buyers and vendors
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Coordinate deliveries and track order fulfillment
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Process payments and prevent fraudulent transactions
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Send order confirmations, updates, and customer support messages
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Improve our services and personalize your experience
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Comply with legal obligations and enforce our terms
                                </Text>
                            </View>
                        </View>

                        {/* Section 3 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                3. Information Sharing and Disclosure
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                We may share your information in the following circumstances:
                            </Text>
                            <View className="ml-4">
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">With Vendors:</Text> We share buyer information necessary to fulfill orders (name, delivery address, contact details)
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">With Delivery Partners:</Text> We share pickup and delivery information to facilitate order delivery
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">With Payment Processors:</Text> We share payment information with secure third-party payment providers
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">For Legal Compliance:</Text> When required by law or to protect our rights and safety
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">Business Transfers:</Text> In connection with mergers, acquisitions, or sales of assets
                                </Text>
                            </View>
                        </View>

                        {/* Section 4 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                4. Data Security
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                We implement appropriate technical and organizational measures to protect your personal information, including:
                            </Text>
                            <View className="ml-4">
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Encryption of sensitive data during transmission and storage
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Regular security assessments and updates
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Access controls and authentication measures
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Secure payment processing through PCI-DSS compliant providers
                                </Text>
                            </View>
                            <Text className="text-base text-gray-700 leading-7 mt-3">
                                However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                            </Text>
                        </View>

                        {/* Section 5 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                5. Your Rights and Choices
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                You have the following rights regarding your personal information:
                            </Text>
                            <View className="ml-4">
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">Access:</Text> Request a copy of your personal data
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">Correction:</Text> Update or correct inaccurate information
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">Deletion:</Text> Request deletion of your account and personal data
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">Opt-out:</Text> Unsubscribe from marketing communications
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • <Text className="font-semibold">Data Portability:</Text> Receive your data in a portable format
                                </Text>
                            </View>
                        </View>

                        {/* Section 6 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                6. Cookies and Tracking Technologies
                            </Text>
                            <Text className="text-base text-gray-700 leading-7">
                                We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and personalize content. You can control cookie preferences through your browser settings, though some features may not function properly if cookies are disabled.
                            </Text>
                        </View>

                        {/* Section 7 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                7. Third-Party Services
                            </Text>
                            <Text className="text-base text-gray-700 leading-7">
                                Our platform may integrate with third-party services such as payment processors, mapping services, and analytics providers. These third parties have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of these third parties.
                            </Text>
                        </View>

                        {/* Section 8 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                8. Children's Privacy
                            </Text>
                            <Text className="text-base text-gray-700 leading-7">
                                Our services are not intended for users under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete such information.
                            </Text>
                        </View>

                        {/* Section 9 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                9. Data Retention
                            </Text>
                            <Text className="text-base text-gray-700 leading-7">
                                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. When you delete your account, we will delete or anonymize your personal data, except where we need to retain it for legal or business purposes.
                            </Text>
                        </View>

                        {/* Section 10 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                10. Changes to This Privacy Policy
                            </Text>
                            <Text className="text-base text-gray-700 leading-7">
                                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of our services after changes become effective constitutes acceptance of the revised policy.
                            </Text>
                        </View>

                        {/* Contact Section */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                11. Contact Us
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
                            </Text>
                            <View className="ml-4 mt-3">
                                <Text className="text-base text-gray-700 leading-7 mb-1">
                                    Email: privacy@marketplace.com
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-1">
                                    Phone: +255 XXX XXX XXX
                                </Text>
                                <Text className="text-base text-gray-700 leading-7">
                                    Address: [Your Business Address]
                                </Text>
                            </View>
                        </View>

                        {/* Footer Note */}
                        <View className="mt-12 pt-8 border-t border-gray-200">
                            <Text className="text-sm text-gray-500 text-center">
                                By using our marketplace services, you acknowledge that you have read and understood this Privacy Policy.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </DesktopLayoutWrapper>
    );
}
