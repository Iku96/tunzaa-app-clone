import React, { useState } from "react";
import { View, Modal, Alert, TextInput } from "react-native";
import { Camera, X, Upload } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";

interface ProofPhotoModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (imageUrl: string, message: string) => void;
  isLoading?: boolean;
  stage: "picked_up" | "delivered";
}

export const ProofPhotoModal: React.FC<ProofPhotoModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
  stage,
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");

  const getModalTitle = () => {
    switch (stage) {
      case "picked_up":
        return "Proof of Pickup";
      case "delivered":
        return "Proof of Delivery";
      default:
        return "Proof Photo";
    }
  };

  const getPlaceholderMessage = () => {
    switch (stage) {
      case "picked_up":
        return "Add any pickup notes or instructions...";
      case "delivered":
        return "Add delivery notes or recipient details...";
      default:
        return "Add notes...";
    }
  };

  const handleSubmit = () => {
    if (!imageUrl.trim()) {
      Alert.alert("Error", "Please take a photo as proof");
      return;
    }

    onSubmit(imageUrl, message);
    
    // Reset form
    setImageUrl("");
    setMessage("");
  };

  const handleClose = () => {
    if (!isLoading) {
      setImageUrl("");
      setMessage("");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <Card className="w-full max-w-md bg-background">
          <View className="p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-foreground">
                {getModalTitle()}
              </Text>
              <Button
                variant="ghost"
                size="icon"
                onPress={handleClose}
                disabled={isLoading}
              >
                <X size={24} className="text-foreground" />
              </Button>
            </View>

            {/* Image Upload Section */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">
                Take Photo
              </Text>
              <ImageUploader
                value={imageUrl}
                onImageSelected={setImageUrl}
                placeholder="Take a photo as proof"
                className="h-40 border-2 border-dashed border-border rounded-lg"
              />
            </View>

            {/* Message Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-foreground mb-2">
                Notes (Optional)
              </Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder={getPlaceholderMessage()}
                multiline
                numberOfLines={3}
                className="w-full p-3 border border-border rounded-lg text-foreground bg-background"
                style={{ textAlignVertical: 'top' }}
              />
            </View>

            {/* Actions */}
            <View className="flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text className="text-sm font-medium">Cancel</Text>
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onPress={handleSubmit}
                disabled={isLoading || !imageUrl.trim()}
              >
                <Text className="text-sm font-bold text-foreground">
                  {isLoading ? "Submitting..." : "Submit"}
                </Text>
              </Button>
            </View>
          </View>
        </Card>
      </View>
    </Modal>
  );
}; 