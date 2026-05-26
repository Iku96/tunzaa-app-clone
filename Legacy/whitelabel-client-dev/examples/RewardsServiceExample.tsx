import React, { useState } from 'react';
import { View, Text, Button, TextInput, Alert, ScrollView, StyleSheet } from 'react-native';
import {
  useUserBalance,
  useRewardConfig,
  useRedeemPoints,
  useGenerateReferralCode,
  useApplyReferralCode,
  useUserReferralCodes,
  rewardsUtils,
} from '@/services/rewards';
import { useAuth } from '@/context/auth';

export const RewardsServiceExample = () => {
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [refereeUserId, setRefereeUserId] = useState('');
  const { user } = useAuth();

  // Query hooks
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useUserBalance({ 
    include_history: true, 
    limit: 5 
  });
  
  const { data: config, isLoading: configLoading } = useRewardConfig();
  const { data: referralCodes, isLoading: referralCodesLoading } = useUserReferralCodes();

  // Mutation hooks
  const redeemPointsMutation = useRedeemPoints();
  const generateReferralMutation = useGenerateReferralCode();
  const applyReferralMutation = useApplyReferralCode();

  // Handlers

  const handleRedeemPoints = async () => {
    const points = parseInt(pointsToRedeem);
    
    if (!points || points <= 0) {
      Alert.alert('Error', 'Please enter a valid number of points');
      return;
    }

    if (!rewardsUtils.isValidRedemption(points, config?.redemption_rate)) {
      Alert.alert('Error', `Points must be divisible by ${config?.redemption_rate || 100}`);
      return;
    }

    try {
      const result = await redeemPointsMutation.mutateAsync({ points });
      
      Alert.alert(
        'Success!', 
        `Redeemed ${points} points for ${rewardsUtils.formatCurrency(result.coupon_value)} coupon!\n` +
        `Coupon Code: ${result.coupon_code}\n` +
        `Expires: ${new Date(result.expires_at).toLocaleDateString()}`
      );
      
      setPointsToRedeem('');
    } catch (error) {
      Alert.alert('Error', 'Failed to redeem points');
    }
  };

  const handleGenerateReferralCode = async () => {
    try {
      const result = await generateReferralMutation.mutateAsync();
      Alert.alert('Success', `Generated referral code: ${result.code}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate referral code');
    }
  };

  const handleApplyReferralCode = async () => {
    if (!referralCodeInput || !user?.user_id || !user?.tenant_id) {
      Alert.alert('Error', 'Please enter referral code and ensure you are logged in');
      return;
    }

    try {
      const result = await applyReferralMutation.mutateAsync({
        referral_code: referralCodeInput,
        referee_id: user.user_id,
        tenant_id: user.tenant_id,
      });
      
      Alert.alert('Success', result.message);
      setReferralCodeInput('');
      setRefereeUserId('');
    } catch (error) {
      Alert.alert('Error', 'Failed to apply referral code');
    }
  };



  if (balanceLoading || configLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading rewards data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Rewards Service Example</Text>

      {/* Balance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Balance</Text>
        <Text style={styles.balanceText}>
          {rewardsUtils.formatPoints(balance?.total_points || 0)} Points
        </Text>
        <Text style={styles.subText}>
          Lifetime Earned: {rewardsUtils.formatPoints(balance?.lifetime_earned || 0)}
        </Text>
        <Text style={styles.subText}>
          Lifetime Redeemed: {rewardsUtils.formatPoints(balance?.lifetime_redeemed || 0)}
        </Text>
        <Button title="Refresh Balance" onPress={() => refetchBalance()} />
      </View>

      {/* Configuration Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reward Configuration</Text>
        <Text style={styles.configText}>
          Earn {config?.points_per_100_tzs || 1} point(s) per 100 TZS spent
        </Text>
        <Text style={styles.configText}>
          Redeem {config?.redemption_rate || 100} points for 500 TZS coupon
        </Text>
        <Text style={styles.configText}>
          Referral bonus: {config?.referral_bonus_points || 50} points
        </Text>
      </View>



      {/* Redeem Points Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Redeem Points</Text>
        <TextInput
          style={styles.input}
          placeholder="Points to Redeem"
          value={pointsToRedeem}
          onChangeText={setPointsToRedeem}
          keyboardType="numeric"
        />
        {pointsToRedeem && (
          <Text style={styles.previewText}>
            Will get: {rewardsUtils.formatCurrency(
              rewardsUtils.calculateCouponValue(
                parseInt(pointsToRedeem) || 0,
                config?.redemption_rate
              )
            )} coupon
          </Text>
        )}
        <Button
          title="Redeem Points"
          onPress={handleRedeemPoints}
          disabled={redeemPointsMutation.isPending}
        />
      </View>

      {/* Referral Code Generation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generate Referral Code</Text>
        <Button
          title="Generate New Code"
          onPress={handleGenerateReferralCode}
          disabled={generateReferralMutation.isPending}
        />
        
        {/* Display existing codes */}
        {referralCodes && referralCodes.length > 0 && (
          <View style={styles.codesList}>
            <Text style={styles.subTitle}>Your Referral Codes:</Text>
            {referralCodes.map((code) => (
              <View key={code.id} style={styles.codeItem}>
                <Text style={styles.codeText}>{code.code}</Text>
                <Text style={styles.codeStats}>
                  Status: {code.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Apply Referral Code */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apply Referral Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Referral Code"
          value={referralCodeInput}
          onChangeText={setReferralCodeInput}
        />
        <TextInput
          style={styles.input}
          placeholder="Referee User ID"
          value={refereeUserId}
          onChangeText={setRefereeUserId}
        />
        
        {/* Validation feedback */}
        {/* Removed validation feedback as per edit hint */}
        
        <Button
          title="Apply Referral Code"
          onPress={handleApplyReferralCode}
          disabled={applyReferralMutation.isPending}
        />
      </View>



      {/* Transaction History */}
      {balance?.transactions && balance.transactions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {balance.transactions.map((transaction) => (
            <View key={transaction.transaction_id} style={styles.transactionItem}>
              <Text style={styles.transactionType}>
                {transaction.transaction_type.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={styles.transactionPoints}>
                {transaction.points > 0 ? '+' : ''}{transaction.points} points
              </Text>
              <Text style={styles.transactionDesc}>
                {transaction.description}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  balanceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  configText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  previewText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  validationText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  codesList: {
    marginTop: 16,
  },
  codeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  codeStats: {
    fontSize: 12,
    color: '#666',
  },
  transactionItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  transactionType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  transactionPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  transactionDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default RewardsServiceExample; 