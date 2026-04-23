import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { 
  MapPin, 
  Truck,
  Package,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface DeliveryStage {
  stage: string;
  timestamp: string;
  location?: { lat: number; lng: number };
  proof?: { photo_url?: string };
  isLatest?: boolean;
}

interface DeliveryTimelineProps {
  timeline: DeliveryStage[];
  currentStage: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  partnerType?: 'individual' | 'business' | 'pickup_point';
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const getStageIcon = (stage: string) => {
  switch (stage.toLowerCase()) {
    case 'assigned':
      return Package;
    case 'picked_up':
      return Package;
    case 'in_transit':
      return Truck;
    case 'delivered':
      return CheckCircle;
    default:
      return MapPin;
  }
};

const getStageColor = (stage: string, currentStage: string, partnerType?: 'individual' | 'business' | 'pickup_point') => {
  // Different stage orders based on partner type
  const stageOrder = partnerType === 'pickup_point' 
    ? ['assigned', 'in_transit', 'delivered']
    : ['assigned', 'picked_up', 'in_transit', 'delivered'];
  
  const currentIndex = stageOrder.indexOf(currentStage.toLowerCase());
  const stageIndex = stageOrder.indexOf(stage.toLowerCase());
  
  if (stageIndex <= currentIndex) {
    return stage.toLowerCase() === 'delivered' ? 'bg-green-500' : 'bg-blue-500';
  }
  return 'bg-gray-400';
};

const getStageTitle = (stage: string, partnerType?: 'individual' | 'business' | 'pickup_point') => {
  switch (stage.toLowerCase()) {
    case 'assigned':
      return partnerType === 'pickup_point' 
        ? 'Assigned to Pickup Point' 
        : 'Assigned to Delivery Partner';
    case 'picked_up':
      return 'Picked Up';
    case 'in_transit':
      return partnerType === 'pickup_point' 
        ? 'Ready for Pickup' 
        : 'In Transit';
    case 'delivered':
      return 'Delivered';
    default:
      return stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

export const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({
  timeline,
  currentStage,
  estimatedDelivery,
  actualDelivery,
  partnerType = 'individual',
  className = '',
  collapsible = true,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Filter timeline based on partner type
  const filteredTimeline = React.useMemo(() => {
    if (partnerType === 'pickup_point') {
      // For pickup points, only show assigned, in_transit, and delivered stages
      return timeline.filter(stage => 
        ['assigned', 'in_transit', 'delivered'].includes(stage.stage.toLowerCase())
      );
    }
    return timeline;
  }, [timeline, partnerType]);

  const renderCollapsedView = () => {
    const latestStage = filteredTimeline[filteredTimeline.length - 1] || { stage: currentStage, timestamp: new Date().toISOString() };
    
    return (
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-2">
          {filteredTimeline.slice(0, Math.min(4, filteredTimeline.length)).map((stage, index) => {
            const IconComponent = getStageIcon(stage.stage);
            
            return (
              <View key={`${stage.stage}-${index}`} className="flex-row items-center">
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center ${
                    getStageColor(stage.stage, currentStage, partnerType)
                  }`}
                >
                  <IconComponent
                    size={12}
                    color="white"
                  />
                </View>
                {index < Math.min(3, filteredTimeline.length - 1) && (
                  <View className={`w-4 h-px ${
                    index < filteredTimeline.length - 1 ? 'bg-blue-500' : 'bg-gray-300'
                  } mx-1`} />
                )}
              </View>
            );
          })}
          {filteredTimeline.length > 4 && (
            <Text className="text-xs text-muted-foreground ml-1">+{filteredTimeline.length - 4}</Text>
          )}
        </View>
        
        <View className="flex-row items-center space-x-2">
          <Text className="text-sm font-medium text-foreground mr-2">
            {getStageTitle(latestStage.stage, partnerType)}
          </Text>
          <Badge variant={currentStage.toLowerCase() === 'delivered' ? 'success' : 'outline'}>
            <Text className="text-xs font-semibold capitalize text-foreground">
              {currentStage.replace('_', ' ')}
            </Text>
          </Badge>
        </View>
      </View>
    );
  };

  const renderExpandedView = () => (
    <View className="space-y-4">
      {filteredTimeline.map((stage, index) => {
        const IconComponent = getStageIcon(stage.stage);
        const isLast = index === filteredTimeline.length - 1;
        
        return (
          <View key={`${stage.stage}-${index}`}>
            <View className="flex-row items-start">
              <View className="mr-3 items-center">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    getStageColor(stage.stage, currentStage, partnerType)
                  }`}
                >
                  <IconComponent
                    size={16}
                    color="white"
                  />
                </View>
                {!isLast && (
                  <View className="w-px h-8 bg-gray-300 mt-2" />
                )}
              </View>
              
              <View className="flex-1">
                <Text className={`font-semibold ${
                  stage.stage.toLowerCase() === 'delivered' ? 'text-green-600' : 
                  getStageColor(stage.stage, currentStage, partnerType).includes('blue') ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {getStageTitle(stage.stage, partnerType)}
                </Text>
                <Text className="text-xs text-muted-foreground mt-1">
                  {format(new Date(stage.timestamp), 'MMM d, yyyy \'at\' h:mm a')}
                </Text>
                {stage.location && (
                  <Text className="text-xs text-muted-foreground">
                    Location: {stage.location.lat.toFixed(4)}, {stage.location.lng.toFixed(4)}
                  </Text>
                )}
                {stage.proof?.photo_url && (
                  <Text className="text-xs text-success mt-1">
                    ✓ Proof of delivery available
                  </Text>
                )}
              </View>
            </View>
            {!isLast && <View className="h-2" />}
          </View>
        );
      })}

      {actualDelivery && (
        <View className="mt-4 pt-4 border-t border-border">
          <Text className="text-sm text-muted-foreground">
            Delivered on: {format(new Date(actualDelivery), 'MMM d, yyyy \'at\' h:mm a')}
          </Text>
        </View>
      )}

      {estimatedDelivery && !actualDelivery && (
        <View className="mt-4 pt-4 border-t border-border">
          <Text className="text-sm text-muted-foreground">
            Estimated delivery: {format(new Date(estimatedDelivery), 'MMM d, yyyy \'at\' h:mm a')}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <Card className={`p-4 ${className}`}>
      <TouchableOpacity 
        onPress={() => collapsible && setIsExpanded(!isExpanded)}
        disabled={!collapsible}
        className="mb-4"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-foreground">
            Delivery Timeline
          </Text>
          {collapsible && (
            <View className="flex-row items-center space-x-2">
              {isExpanded ? (
                <ChevronUp size={20} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={20} className="text-muted-foreground" />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>

      {isExpanded || !collapsible ? renderExpandedView() : renderCollapsedView()}
    </Card>
  );
};

export default DeliveryTimeline; 