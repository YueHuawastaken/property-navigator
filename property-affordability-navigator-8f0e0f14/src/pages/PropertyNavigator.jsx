import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Home, DollarSign, FileText, Gift } from "lucide-react";

import InputForm from "../components/property/InputForm";
import ResultsDashboard from "../components/property/ResultsDashboard";
import RentYieldCalculator from "../components/property/RentYieldCalculator";
import LoanComparisonTool from "../components/property/LoanComparisonTool";
import SellersNetProceedsCalculator from "../components/property/SellersNetProceedsCalculator";
import ProgressPaymentCalculator from "../components/property/ProgressPaymentCalculator";
import LeaseStampDutyCalculator from "../components/property/LeaseStampDutyCalculator";
import { calculateLoanEligibility, calculateStampDuties, calculateAffordabilityBreakdown, checkGrantEligibility } from "../components/property/calculations";

export default function PropertyNavigator() {
  const [formData, setFormData] = useState({
    citizenship: "",
    isFirstTime: false,
    propertyCount: "0",
    annualIncome: "",
    cpfSavings: "",
    cashSavings: "",
    propertyType: "",
    propertyPrice: "",
  });

  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleCalculate = async () => {
    setIsCalculating(true);
    
    // Simulate calculation time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const numericData = {
      ...formData,
      annualIncome: parseFloat(formData.annualIncome) || 0,
      cpfSavings: parseFloat(formData.cpfSavings) || 0,
      cashSavings: parseFloat(formData.cashSavings) || 0,
      propertyPrice: parseFloat(formData.propertyPrice) || 0,
      propertyCount: parseInt(formData.propertyCount) || 0,
    };

    const loanEligibility = calculateLoanEligibility(numericData.annualIncome);
    const stampDuties = calculateStampDuties(numericData.propertyPrice, numericData.citizenship, numericData.propertyCount);
    const affordability = calculateAffordabilityBreakdown(numericData, loanEligibility, stampDuties);
    const grants = checkGrantEligibility(numericData);

    setResults({
      loanEligibility,
      stampDuties,
      affordability,
      grants
    });
    
    setIsCalculating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <Home className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                Singapore Property Navigator
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm">Know Your True Affordability</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 py-4 sm:py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8">
          {/* Input Form - Full width on mobile, sidebar on desktop */}
          <div className="xl:col-span-1 order-1 xl:order-1">
            <Card className="xl:sticky xl:top-8 shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calculator className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  Property Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <InputForm 
                  formData={formData}
                  onInputChange={handleInputChange}
                  onCalculate={handleCalculate}
                  isCalculating={isCalculating}
                />
              </CardContent>
            </Card>
          </div>

          {/* Results Content - Full width on mobile, main content on desktop */}
          <div className="xl:col-span-2 space-y-6 sm:space-y-8 order-2 xl:order-2">
            {results ? (
              <ResultsDashboard results={results} formData={formData} />
            ) : (
              <Card className="shadow-lg border-0 h-64 sm:h-96">
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">
                    Ready to Calculate?
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 max-w-md">
                    Fill in your details and click "Calculate Affordability" to see your property affordability analysis.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Leasing & Investment Tools Section */}
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 border-b pb-2">Leasing & Investment Tools</h2>
              <div className="grid grid-cols-1 gap-6 sm:gap-8">
                <RentYieldCalculator />
                <LeaseStampDutyCalculator />
              </div>
            </div>
            
            {/* Loan Comparison Tool */}
            <LoanComparisonTool 
              initialLoanAmount={results?.affordability.loanAmount} 
              maxLoanBasedOnMSR={results?.affordability.maxLoanBasedOnMSR}
              maxLoanBasedOnTDSR={results?.affordability.maxLoanBasedOnTDSR}
            />

            {/* Seller's Net Proceeds Calculator */}
            <SellersNetProceedsCalculator />
            
            {/* Progress Payment Calculator */}
            <ProgressPaymentCalculator />
          </div>
        </div>
      </div>
    </div>
  );
}