import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function DisclaimerCard() {
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertCircle className="h-5 w-5 text-amber-600" />
      <AlertDescription className="text-amber-800 font-medium">
        <strong>Disclaimer:</strong> This calculator provides estimates for informational purposes only. 
        Please seek independent legal and financial advice before making property decisions.
      </AlertDescription>
    </Alert>
  );
}