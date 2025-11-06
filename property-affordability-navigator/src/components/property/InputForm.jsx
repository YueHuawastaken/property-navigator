
import React, { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import TooltipInfo from "./TooltipInfo";
import PropertyEligibilityAlert from "./PropertyEligibilityAlert";

export default function InputForm({ formData, onInputChange, onCalculate, isCalculating }) {
  const isFormValid = formData.citizenship && formData.annualIncome && formData.propertyType && formData.propertyPrice;

  // Get eligible property types based on citizenship
  const getEligiblePropertyTypes = useCallback(() => {
    switch (formData.citizenship) {
      case 'citizen':
        return [
          { value: 'hdb', label: 'HDB Resale' },
          { value: 'condo', label: 'Private Condo' },
          { value: 'ec', label: 'Executive Condominium (EC)' },
          { value: 'landed', label: 'Landed Property' }
        ];
      case 'pr':
        return [
          { value: 'hdb', label: 'HDB Resale (after 3 years PR)' },
          { value: 'condo', label: 'Private Condo' },
          { value: 'ec', label: 'Executive Condominium (EC)' }
        ];
      case 'foreigner':
        return [
          { value: 'condo', label: 'Private Condo' }
        ];
      default:
        return [];
    }
  }, [formData.citizenship]);

  // Reset property type if it becomes ineligible
  useEffect(() => {
    if (formData.citizenship && formData.propertyType) {
      const eligibleTypes = getEligiblePropertyTypes().map(type => type.value);
      if (!eligibleTypes.includes(formData.propertyType)) {
        onInputChange('propertyType', '');
      }
    }
  }, [formData.citizenship, formData.propertyType, getEligiblePropertyTypes, onInputChange]);

  return (
    <div className="space-y-6">
      {/* Citizenship Status */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-slate-700">Citizenship Status</Label>
          <TooltipInfo content="Your citizenship impacts Additional Buyer's Stamp Duty (ABSD) and property eligibility" />
        </div>
        <RadioGroup
          value={formData.citizenship}
          onValueChange={(value) => onInputChange('citizenship', value)}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="citizen" id="citizen" />
            <Label htmlFor="citizen" className="text-sm">Singapore Citizen</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pr" id="pr" />
            <Label htmlFor="pr" className="text-sm">Permanent Resident</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="foreigner" id="foreigner" />
            <Label htmlFor="foreigner" className="text-sm">Foreigner</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Property Eligibility Alert */}
      <PropertyEligibilityAlert citizenship={formData.citizenship} />

      {/* Property Count for ABSD */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="propertyCount" className="text-sm font-medium text-slate-700">
            Number of Properties Owned
          </Label>
          <TooltipInfo content="Enter the number of residential properties you currently own in Singapore. This determines your ABSD rate." />
        </div>
        <Input
          id="propertyCount"
          type="number"
          min="0"
          placeholder="e.g. 0"
          value={formData.propertyCount}
          onChange={(e) => onInputChange('propertyCount', e.target.value)}
          className="border-slate-300 focus:border-blue-500"
        />
      </div>

      {/* First-Time Buyer */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="firstTime"
          checked={formData.isFirstTime}
          onCheckedChange={(checked) => onInputChange('isFirstTime', checked)}
        />
        <Label htmlFor="firstTime" className="text-sm font-medium text-slate-700">
          First-Time Buyer?
        </Label>
      </div>

      {/* Annual Income */}
      <div className="space-y-2">
        <Label htmlFor="income" className="text-sm font-medium text-slate-700">
          Gross Annual Income (S$)
        </Label>
        <Input
          id="income"
          type="number"
          placeholder="e.g. 120000"
          value={formData.annualIncome}
          onChange={(e) => onInputChange('annualIncome', e.target.value)}
          className="border-slate-300 focus:border-blue-500"
        />
      </div>

      {/* CPF OA Savings */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="cpf" className="text-sm font-medium text-slate-700">
            CPF OA Savings for Purchase (S$)
          </Label>
          <TooltipInfo content="Ordinary Account savings you can use for housing" />
        </div>
        <Input
          id="cpf"
          type="number"
          placeholder="e.g. 80000"
          value={formData.cpfSavings}
          onChange={(e) => onInputChange('cpfSavings', e.target.value)}
          className="border-slate-300 focus:border-blue-500"
        />
      </div>

      {/* Cash Savings */}
      <div className="space-y-2">
        <Label htmlFor="cash" className="text-sm font-medium text-slate-700">
          Cash Savings for Purchase (S$)
        </Label>
        <Input
          id="cash"
          type="number"
          placeholder="e.g. 50000"
          value={formData.cashSavings}
          onChange={(e) => onInputChange('cashSavings', e.target.value)}
          className="border-slate-300 focus:border-blue-500"
        />
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Property Type</Label>
        <Select 
          value={formData.propertyType} 
          onValueChange={(value) => onInputChange('propertyType', value)}
          disabled={!formData.citizenship}
        >
          <SelectTrigger className="border-slate-300 focus:border-blue-500">
            <SelectValue placeholder={formData.citizenship ? "Select property type" : "Select citizenship first"} />
          </SelectTrigger>
          <SelectContent>
            {getEligiblePropertyTypes().map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Property Price */}
      <div className="space-y-2">
        <Label htmlFor="price" className="text-sm font-medium text-slate-700">
          Target Property Price (S$)
        </Label>
        <Input
          id="price"
          type="number"
          placeholder="e.g. 800000"
          value={formData.propertyPrice}
          onChange={(e) => onInputChange('propertyPrice', e.target.value)}
          className="border-slate-300 focus:border-blue-500"
        />
      </div>

      {/* Calculate Button */}
      <Button 
        onClick={onCalculate}
        disabled={!isFormValid || isCalculating}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {isCalculating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Calculating...
          </>
        ) : (
          'Calculate Affordability'
        )}
      </Button>
    </div>
  );
}
