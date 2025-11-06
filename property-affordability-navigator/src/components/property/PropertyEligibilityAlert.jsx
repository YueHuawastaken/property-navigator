import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle } from "lucide-react";

export default function PropertyEligibilityAlert({ citizenship }) {
  if (!citizenship) return null;

  const getAlertContent = () => {
    switch (citizenship) {
      case 'citizen':
        return {
          icon: Info,
          variant: "default",
          message: "As a Singapore Citizen, you can purchase all property types with no restrictions."
        };
      case 'pr':
        return {
          icon: Info,
          variant: "default", 
          message: "As a Permanent Resident: You can buy private condos and ECs immediately. HDB resale flats available after 3 years of PR status. New HDB flats are not available."
        };
      case 'foreigner':
        return {
          icon: AlertTriangle,
          variant: "destructive",
          message: "As a Foreigner: Only private condos are available. HDB flats are restricted. Landed properties require LDAU approval."
        };
      default:
        return null;
    }
  };

  const alertContent = getAlertContent();
  if (!alertContent) return null;

  const IconComponent = alertContent.icon;

  return (
    <Alert variant={alertContent.variant} className="shadow-sm">
      <IconComponent className="h-4 w-4" />
      <AlertDescription className="text-sm">
        {alertContent.message}
      </AlertDescription>
    </Alert>
  );
}