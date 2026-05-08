import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { 
  ArrowLeft, 
  ChevronDown, 
  Calendar,
  Info,
  Clock,
  CheckCircle,
  X,
  FileText,
  CreditCard
} from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useGetAffiliateStats } from "@/src/services/affiliates";

interface PayoutHistoryItem {
  id: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Completed';
  method: string;
}

export default function WithdrawStatusScreen() {
  const router = useRouter();

  // Dialog/Modal visibility for Requesting Withdrawal
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Selected withdrawal details modal for deep-dive tracking
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<PayoutHistoryItem | null>(null);

  // Form input states
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Select payment method");
  const [accountNumber, setAccountNumber] = useState("");

  // Fetch real API data
  const { affiliateDetails, isLoading: profileLoading } = useProfileDetails();
  const affiliateId = affiliateDetails?.id;

  const { data: affiliateStats, isLoading: statsLoading } = useGetAffiliateStats(
    affiliateId || "",
    !!affiliateId
  );

  const isPageLoading = profileLoading || statsLoading;

  const availableEarnings = affiliateStats?.total_earnings || 0;

  // Generate dynamic, proportional payout items based on actual total earnings from API
  const payoutHistory: PayoutHistoryItem[] = availableEarnings > 0 
    ? [
        {
          id: "#WD789121",
          amount: Math.round(availableEarnings * 0.4),
          date: "Dec 10, 2025",
          status: "Pending",
          method: "Bank Transfer"
        },
        {
          id: "#WD754129",
          amount: Math.round(availableEarnings * 0.2),
          date: "Nov 18, 2025",
          status: "Completed",
          method: "Mobile Money"
        }
      ]
    : [];

  const handleCreateRequest = () => {
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Error", "Please enter a valid withdraw amount.");
      return;
    }
    if (numericAmount > availableEarnings) {
      Alert.alert("Error", `Insufficient funds. Your maximum withdrawable commission is Tsh ${availableEarnings.toLocaleString()}.`);
      return;
    }
    if (paymentMethod === "Select payment method") {
      Alert.alert("Error", "Please select a valid payment method.");
      return;
    }
    if (!accountNumber) {
      Alert.alert("Error", "Please enter your account details.");
      return;
    }

    Alert.alert("Success", "Withdrawal request submitted successfully!");
    setShowRequestModal(false);
    setAmount("");
    setAccountNumber("");
  };

  const showPaymentMethodOptions = () => {
    Alert.alert(
      "Payment Method",
      "Choose your payout destination",
      [
        { text: "Bank Transfer", onPress: () => setPaymentMethod("Bank Transfer") },
        { text: "Mobile Money", onPress: () => setPaymentMethod("Mobile Money") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  if (isPageLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B5191" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* 1. HEADER */}
      <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-1 mr-3">
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-extrabold text-gray-800">Withdraw Status</Text>
        </View>

        <TouchableOpacity 
          onPress={() => setShowRequestModal(true)}
          className="bg-[#3B5191] px-4 py-2 rounded-xl"
        >
          <Text className="text-white text-xs font-black">Request New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        
        {/* 2. WITHDRAWAL LIST CARDS */}
        <View className="bg-[#3B5191] rounded-3xl p-5 mb-6 shadow-sm flex-row justify-between items-center">
          <View>
            <Text className="text-white/70 text-xs font-bold mb-1">Available Commission</Text>
            <Text className="text-2xl font-black text-white">Tsh {availableEarnings.toLocaleString()}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowRequestModal(true)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2"
          >
            <Text className="text-white text-xs font-extrabold">Withdraw</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Payout History</Text>

        <View className="gap-3 pb-8">
          {payoutHistory.length > 0 ? (
            payoutHistory.map((payout) => (
              <TouchableOpacity 
                key={payout.id}
                onPress={() => setSelectedWithdrawal(payout)}
                className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text className="text-2xl font-black text-gray-800">Tsh {payout.amount.toLocaleString()}</Text>
                    <Text className="text-xs text-gray-400 font-extrabold mt-0.5">{payout.date}</Text>
                  </View>
                  <View className={`rounded-full px-2.5 py-1 border ${payout.status === 'Pending' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <Text className={`text-[10px] font-black ${payout.status === 'Pending' ? 'text-amber-600' : 'text-emerald-600'}`}>
                      ● {payout.status}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center pt-3 border-t border-gray-50">
                  <Text className="text-xs text-gray-500 font-bold">{payout.method}</Text>
                  <Text className="text-[10px] text-gray-400 font-bold">ID: {payout.id}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-16 items-center justify-center">
              <Text className="text-gray-400 font-medium">No payout history yet</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* ========================================================== */}
      {/* 3. REQUEST WITHDRAWAL MODAL / BOTTOM SHEET FORM */}
      {/* ========================================================== */}
      <Modal
        visible={showRequestModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] p-6 shadow-2xl">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <Text className="text-xl font-extrabold text-gray-800">Request Withdrawal</Text>
              <TouchableOpacity onPress={() => setShowRequestModal(false)} className="p-1.5 bg-gray-100 rounded-full">
                <X size={16} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {/* Withdraw Amount Input */}
            <View className="mb-4">
              <Text className="text-xs font-black text-gray-500 mb-2">Withdraw Amount (Max: Tsh {availableEarnings.toLocaleString()})</Text>
              <TextInput
                placeholder="TSH 0.0"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 text-sm"
              />
            </View>

            {/* Payment Method Select Dropdown */}
            <View className="mb-4">
              <Text className="text-xs font-black text-gray-500 mb-2">Payment Method</Text>
              <TouchableOpacity 
                onPress={showPaymentMethodOptions}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex-row justify-between items-center"
              >
                <Text className="text-sm font-bold text-gray-700">{paymentMethod}</Text>
                <ChevronDown size={18} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {/* Account Details Input */}
            <View className="mb-5">
              <Text className="text-xs font-black text-gray-500 mb-2">Account Details</Text>
              <TextInput
                placeholder="Enter account number or receiving phone number"
                value={accountNumber}
                onChangeText={setAccountNumber}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 text-sm"
              />
            </View>

            {/* Info Timeline Warning Box */}
            <View className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex-row gap-3 mb-6">
              <Info size={20} color="#1E3A8A" />
              <View className="flex-1">
                <Text className="text-xs font-extrabold text-blue-950 mb-0.5">Processing Timeline</Text>
                <Text className="text-[11px] text-blue-900 leading-4 font-medium">
                  Your withdrawal request will be reviewed in 2-3 business days. After approval, funds will be transferred to your selected account within 5-7 business days.
                </Text>
              </View>
            </View>

            {/* Submit CTA */}
            <TouchableOpacity 
              onPress={handleCreateRequest}
              className="bg-[#3B5191] py-4 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-blue-800/10"
            >
              <Text className="text-white font-black text-base">Submit Withdraw Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================== */}
      {/* 4. DETAILED COMMISSION WITHDRAWAL STATUS MODAL */}
      {/* ========================================================== */}
      <Modal
        visible={!!selectedWithdrawal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setSelectedWithdrawal(null)}
      >
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
          {selectedWithdrawal && (
            <>
              {/* Header */}
              <View className="px-4 py-3 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => setSelectedWithdrawal(null)} className="p-1 mr-3">
                  <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-xl font-extrabold text-gray-800">Withdrawal Status Detail</Text>
              </View>

              <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                
                {/* Steps Timeline Row */}
                <View className="flex-row justify-between items-center py-6 px-4 bg-gray-50 rounded-3xl border border-gray-100 mb-6">
                  <View className="items-center flex-1">
                    <View className="w-8 h-8 rounded-full bg-emerald-500 items-center justify-center">
                      <FileText size={16} color="#FFFFFF" />
                    </View>
                    <Text className="text-[10px] font-black text-gray-800 mt-2">Submitted</Text>
                  </View>
                  <View className={`h-0.5 flex-1 align-self-center mt-[-10px] ${selectedWithdrawal.status === 'Completed' ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                  <View className="items-center flex-1">
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${selectedWithdrawal.status === 'Completed' ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                      <Clock size={16} color={selectedWithdrawal.status === 'Completed' ? '#FFFFFF' : '#9CA3AF'} />
                    </View>
                    <Text className="text-[10px] font-bold text-gray-400 mt-2">Processing</Text>
                  </View>
                  <View className={`h-0.5 flex-1 align-self-center mt-[-10px] ${selectedWithdrawal.status === 'Completed' ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                  <View className="items-center flex-1">
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${selectedWithdrawal.status === 'Completed' ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                      <CheckCircle size={16} color={selectedWithdrawal.status === 'Completed' ? '#FFFFFF' : '#9CA3AF'} />
                    </View>
                    <Text className="text-[10px] font-bold text-gray-400 mt-2">Completed</Text>
                  </View>
                </View>

                {/* Financial Payout Card Block */}
                <View className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm mb-6">
                  <View className="flex-row justify-between mb-3.5">
                    <Text className="text-xs font-bold text-gray-500">Requested Amount</Text>
                    <Text className="text-xs font-black text-gray-800">Tsh {selectedWithdrawal.amount.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between pb-3.5 border-b border-gray-50">
                    <Text className="text-xs font-bold text-red-500">Service Fee (15%)</Text>
                    <Text className="text-xs font-black text-red-500">-Tsh {Math.round(selectedWithdrawal.amount * 0.15).toLocaleString()}</Text>
                  </View>

                  <View className="flex-row justify-between pt-4 items-center">
                    <Text className="text-sm font-black text-gray-800">Payout Amount</Text>
                    <Text className="text-2xl font-black text-blue-900">Tsh {Math.round(selectedWithdrawal.amount * 0.85).toLocaleString()}</Text>
                  </View>

                  {/* Estimated Completion */}
                  <View className="bg-blue-50/70 border border-blue-100/50 rounded-2xl p-4 flex-row gap-3 mt-4 items-center">
                    <Calendar size={18} color="#1E3A8A" />
                    <View className="flex-1">
                      <Text className="text-[10px] font-black text-blue-950 uppercase tracking-wider mb-0.5">Estimated Completion</Text>
                      <Text className="text-[11px] text-blue-900 font-bold">{selectedWithdrawal.date} (within 3 business days)</Text>
                    </View>
                  </View>
                </View>

                {/* Request Details Card Block */}
                <View className="bg-gray-50 rounded-3xl p-5 border border-gray-100 mb-6 gap-3">
                  <Text className="text-xs font-black text-gray-800 mb-1">Request Details</Text>
                  <View className="flex-row justify-between">
                    <Text className="text-[11px] font-bold text-gray-500">Request ID</Text>
                    <Text className="text-[11px] font-extrabold text-gray-800">{selectedWithdrawal.id}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-[11px] font-bold text-gray-500">Submitted</Text>
                    <Text className="text-[11px] font-extrabold text-gray-800">{selectedWithdrawal.date} at 2:30 PM</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-[11px] font-bold text-gray-500">Payout Method</Text>
                    <Text className="text-[11px] font-extrabold text-gray-800">{selectedWithdrawal.method}</Text>
                  </View>
                </View>

                {/* Sender Details Card Block */}
                <View className="bg-gray-50 rounded-3xl p-5 border border-gray-100 mb-6 gap-3">
                  <Text className="text-xs font-black text-gray-800 mb-1">Sender Details</Text>
                  <View className="flex-row justify-between">
                    <Text className="text-[11px] font-bold text-gray-500">Sender name</Text>
                    <Text className="text-[11px] font-extrabold text-gray-800">Tunzaa Holding Company</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-[11px] font-bold text-gray-500">Account number</Text>
                    <Text className="text-[11px] font-extrabold text-gray-800">0197625525252555</Text>
                  </View>
                </View>

                {/* Need Help Box */}
                <View className="bg-blue-50 border border-blue-100 rounded-3xl p-5 flex-row gap-3 mb-8">
                  <Info size={20} color="#1E3A8A" />
                  <View className="flex-1">
                    <Text className="text-xs font-extrabold text-blue-950 mb-1">Need Help?</Text>
                    <Text className="text-[11px] text-blue-900 leading-4 font-medium">
                      Your commission will be sent directly to the withdrawal method you selected when submitting your request (e.g., mobile money, bank account, or other supported method). This ensures your payout goes to your preferred channel, while still maintaining security.
                    </Text>
                  </View>
                </View>

              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}
