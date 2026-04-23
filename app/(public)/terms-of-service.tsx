import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useI18n } from "@/hooks/useI18n";

export default function TermsOfServicePage() {
    usePageTitle("Terms of Service");
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
                                Terms of Service
                            </Text>
                            <Text className="text-sm text-gray-500">
                                Last Updated: November 20, 2024
                            </Text>
                        </View>

                        {/* Introduction */}
                        <View className="mb-8">
                            <Text className="text-base text-gray-700 leading-7">
                                Welcome to our marketplace platform. These Terms of Service ("Terms") govern your access to and use of our marketplace services. By accessing or using our platform, you agree to be bound by these Terms. Please read them carefully.
                            </Text>
                        </View>

                        {/* Section 1 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                1. Acceptance of Terms
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                By creating an account or using our marketplace, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use our services.
                            </Text>
                            <Text className="text-base text-gray-700 leading-7">
                                You must be at least 18 years old to use our platform. By using our services, you represent and warrant that you meet this age requirement.
                            </Text>
                        </View>

                        {/* Section 2 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                2. User Accounts and Registration
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                To use certain features of our marketplace, you must register for an account. You agree to:
                            </Text>
                            <View className="ml-4">
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Provide accurate, current, and complete information during registration
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Maintain and update your information to keep it accurate and current
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Maintain the security and confidentiality of your account credentials
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Accept responsibility for all activities under your account
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Notify us immediately of any unauthorized access to your account
                                </Text>
                            </View>
                        </View>

                        {/* Section 3 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                3. Marketplace Rules for Buyers
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                As a buyer on our platform, you agree to:
                            </Text>
                            <View className="ml-4">
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Provide accurate delivery information and contact details
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Pay for all orders placed through your account
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Accept deliveries or arrange for pickup as agreed
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Communicate respectfully with vendors and delivery partners
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Report any issues or disputes through proper channels
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Not abuse return or refund policies
                                </Text>
                            </View>
                        </View>

                        {/* Section 4 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                4. Marketplace Rules for Vendors
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                As a vendor on our platform, you agree to:
                            </Text>
                            <View className="ml-4">
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Provide accurate product descriptions, pricing, and availability
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Fulfill orders promptly and professionally
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Maintain product quality and safety standards
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Handle customer inquiries and complaints promptly
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Process refunds and returns according to stated policies
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Not sell prohibited, illegal, or counterfeit items
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Comply with all applicable laws and regulations
                                </Text>
                            </View>
                        </View>

                        {/* Section 5 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                5. Delivery Partners
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                As a delivery partner, you agree to:
                            </Text>
                            <View className="ml-4">
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Accept and fulfill delivery requests in a timely manner
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Maintain your vehicle in safe and operational condition
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Handle products with care during delivery
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Communicate professionally with buyers and vendors
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Follow delivery instructions and safety protocols
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Maintain valid licenses, insurance, and permits as required
                                </Text>
                            </View>
                        </View>

                        {/* Section 6 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                6. Payment Terms
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                Payment processing is subject to the following terms:
                            </Text>
                            <View className="ml-4">
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • All prices are displayed in the local currency (TZS)
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Payment must be completed before order fulfillment (unless cash on delivery is selected)
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • We use third-party payment processors and are not responsible for their services
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Vendors receive payment after successful order completion, minus platform fees
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Delivery partners receive payment after successful delivery confirmation
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Refunds are processed according to our refund policy and applicable laws
                                </Text>
                            </View>
                        </View>

                        {/* Section 7 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                7. Intellectual Property Rights
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                The platform and its content, including but not limited to text, graphics, logos, and software, are owned by us or our licensors and protected by intellectual property laws.
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                Vendors retain ownership of their product listings and content but grant us a license to display and distribute this content on our platform. You may not reproduce, distribute, or create derivative works from our platform without permission.
                            </Text>
                        </View>

                        {/* Section 8 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                8. Prohibited Activities
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                You may not:
                            </Text>
                            <View className="ml-4">
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Use the platform for any illegal purpose or in violation of any laws
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Engage in fraudulent activities or misrepresent yourself
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Harass, abuse, or harm other users
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Interfere with or disrupt the platform's operation
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Attempt to gain unauthorized access to our systems
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Use automated systems to access the platform without permission
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Collect or store personal data of other users
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Post or transmit malicious code or viruses
                                </Text>
                            </View>
                        </View>

                        {/* Section 9 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                9. Limitation of Liability
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                To the maximum extent permitted by law:
                            </Text>
                            <View className="ml-4">
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • We provide the platform "as is" without warranties of any kind
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • We are not liable for the quality, safety, or legality of items sold by vendors
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • We are not responsible for the actions of buyers, vendors, or delivery partners
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • We are not liable for indirect, incidental, or consequential damages
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Our total liability shall not exceed the fees paid by you in the past 12 months
                                </Text>
                            </View>
                        </View>

                        {/* Section 10 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                10. Dispute Resolution
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                In the event of a dispute:
                            </Text>
                            <View className="ml-4">
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • First attempt to resolve the issue through our customer support
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • If unresolved, disputes may be subject to mediation or arbitration
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • These Terms are governed by the laws of Tanzania
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • You agree to the exclusive jurisdiction of courts in Tanzania
                                </Text>
                            </View>
                        </View>

                        {/* Section 11 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                11. Termination
                            </Text>
                            <Text className="text-base text-gray-700 leading-7">
                                We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any other reason at our discretion. You may also terminate your account at any time through your account settings. Upon termination, your right to access the platform will cease immediately.
                            </Text>
                        </View>

                        {/* Section 12 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                12. Changes to Terms
                            </Text>
                            <Text className="text-base text-gray-700 leading-7">
                                We may modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our platform and updating the "Last Updated" date. Your continued use of the platform after changes become effective constitutes acceptance of the modified Terms.
                            </Text>
                        </View>

                        {/* Section 13 */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                13. Platform Fees
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                We charge the following fees for using our platform:
                            </Text>
                            <View className="ml-4">
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Vendors: Platform fee on each completed transaction (percentage varies)
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Delivery Partners: Service fee structure based on delivery distance and type
                                </Text>
                                <Text className="text-base text-gray-700 leading-7 mb-2">
                                    • Buyers: No platform fees (delivery fees may apply)
                                </Text>
                            </View>
                            <Text className="text-base text-gray-700 leading-7 mt-3">
                                Fee structures may change with reasonable notice to users.
                            </Text>
                        </View>

                        {/* Contact Section */}
                        <View className="mb-8">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                14. Contact Us
                            </Text>
                            <Text className="text-base text-gray-700 leading-7 mb-3">
                                If you have questions about these Terms, please contact us:
                            </Text>
                            <View className="ml-4 mt-3">
                                <Text className="text-base text-gray-700 leading-7 mb-1">
                                    Email: support@marketplace.com
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
                                By using our marketplace, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </DesktopLayoutWrapper>
    );
}
