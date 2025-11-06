import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileSignature, Calculator, AlertCircle } from "lucide-react";

export default function LeaseStampDutyCalculator() {
  const [monthlyRent, setMonthlyRent] = useState("");
  const [leaseDuration, setLeaseDuration] = useState(""); // In years, can be decimal
  const [stampDuty, setStampDuty] = useState(null);

  const calculateStampDuty = () => {
    const rent = parseFloat(monthlyRent);
    const durationYears = parseFloat(leaseDuration);

    if (isNaN(rent) || rent <= 0 || isNaN(durationYears) || durationYears <= 0) {
      setStampDuty(null);
      return;
    }

    const totalRent = rent * durationYears * 12;
    let duty = 0;

    if (durationYears <= 4) {
      // For leases of 4 years or less, the rate is 0.4% of the total rent.
      duty = totalRent * 0.004;
    } else {
      // For leases over 4 years, it's 0.4% of 4x the Average Annual Rent (AAR).
      const averageAnnualRent = totalRent / durationYears;
      duty = (averageAnnualRent * 4) * 0.004;
    }
    
    // Minimum duty is $1, but we will show calculated value and note this in disclaimer.
    const finalDuty = Math.max(1, duty);

    setStampDuty(finalDuty);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(amount);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-t-lg border-l-4 border-indigo-500">
        <CardTitle className="flex items-center gap-2 text-indigo-800">
          <FileSignature className="w-5 h-5" />
          Lease Stamp Duty Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="leaseMonthlyRent">Monthly Rent (S$)</Label>
            <Input 
              id="leaseMonthlyRent" 
              type="number" 
              placeholder="e.g. 3500"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leaseDuration">Lease Duration (Years)</Label>
            <Input 
              id="leaseDuration" 
              type="number" 
              step="0.5"
              placeholder="e.g. 2 for 2 years"
              value={leaseDuration}
              onChange={(e) => setLeaseDuration(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={calculateStampDuty} className="w-full bg-indigo-600 hover:bg-indigo-700">
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Stamp Duty
        </Button>

        {stampDuty !== null && (
          <div className="text-center bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <p className="text-sm font-medium text-indigo-800">Estimated Lease Stamp Duty</p>
            <p className="text-4xl font-extrabold text-indigo-600 my-2">{formatCurrency(stampDuty)}</p>
          </div>
        )}

        <Alert variant="default" className="bg-slate-50 border-slate-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm text-slate-600">
              Lease duty is calculated at 0.4% of the total rent for leases up to 4 years. The agreement must be stamped by IRAS within 14 days of signing in Singapore. The minimum duty payable is S$1.
            </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}