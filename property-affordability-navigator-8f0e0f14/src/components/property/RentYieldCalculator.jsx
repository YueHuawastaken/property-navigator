import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Calculator, DollarSign, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TooltipInfo from "./TooltipInfo";

export default function RentYieldCalculator() {
  const [inputs, setInputs] = useState({
    purchasePrice: "1199999",
    monthlyRent: "4000",
    isLeveraged: true,
    loanAmount: "500000",
    interestRate: "3.5",
    loanTenure: "25",
    monthlyMaintenance: "300",
    monthlySinkingFund: "50",
    annualInsurance: "300",
    annualValue: "42000",
    propertyTaxStatus: "owner-occupied"
  });

  const [results, setResults] = useState(null);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculatePropertyTax = useMemo(() => {
    const av = parseFloat(inputs.annualValue) || 0;
    if (av === 0) return 0;
    
    let tax = 0;
    if (inputs.propertyTaxStatus === 'rented') {
      // 2024 IRAS Non-Owner-Occupied Rates (calculated by tiers from highest AV downwards)
      if (av > 100000) tax += (av - 100000) * 0.36;
      if (av > 60000) tax += (Math.min(av, 100000) - 60000) * 0.36;
      if (av > 45000) tax += (Math.min(av, 60000) - 45000) * 0.28;
      if (av > 30000) tax += (Math.min(av, 45000) - 30000) * 0.20;
      if (av > 0) tax += Math.min(av, 30000) * 0.12;
    } else { // Owner-Occupied (calculated by tiers from highest AV downwards)
      // 2024 IRAS Owner-Occupied Rates
      if (av > 130000) tax += (av - 130000) * 0.32;
      if (av > 100000) tax += (Math.min(av, 130000) - 100000) * 0.26;
      if (av > 85000) tax += (Math.min(av, 100000) - 85000) * 0.20;
      if (av > 70000) tax += (Math.min(av, 85000) - 70000) * 0.14;
      if (av > 55000) tax += (Math.min(av, 70000) - 55000) * 0.10;
      if (av > 40000) tax += (Math.min(av, 55000) - 40000) * 0.06;
      if (av > 30000) tax += (Math.min(av, 40000) - 30000) * 0.05;
      if (av > 8000) tax += (Math.min(av, 30000) - 8000) * 0.04;
      // First $8,000 is 0% tax for owner-occupied properties
    }
    
    return tax;
  }, [inputs.annualValue, inputs.propertyTaxStatus]);

  const calculateYields = () => {
    const purchasePrice = parseFloat(inputs.purchasePrice) || 0;
    const monthlyRent = parseFloat(inputs.monthlyRent) || 0;
    const loanAmount = parseFloat(inputs.loanAmount) || 0;
    const interestRate = parseFloat(inputs.interestRate) || 0;
    const loanTenure = parseFloat(inputs.loanTenure) || 0;
    const monthlyMaintenance = parseFloat(inputs.monthlyMaintenance) || 0;
    const monthlySinkingFund = parseFloat(inputs.monthlySinkingFund) || 0;
    const annualInsurance = parseFloat(inputs.annualInsurance) || 0;

    if (purchasePrice === 0 || monthlyRent === 0) {
      setResults(null);
      return;
    }

    // 1. Calculate Monthly Mortgage
    let monthlyMortgage = 0;
    if (inputs.isLeveraged && loanAmount > 0 && interestRate > 0 && loanTenure > 0) {
      const monthlyRate = (interestRate / 100) / 12;
      const numPayments = loanTenure * 12;
      monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    // 2. Calculate recurring monthly expenses
    const monthlyPropertyTax = calculatePropertyTax / 12;
    const monthlyInsurance = annualInsurance / 12;
    const totalRecurringMonthlyExpenses = monthlyMortgage + monthlyPropertyTax + monthlyMaintenance + monthlySinkingFund + monthlyInsurance;
    
    // 3. Calculate Recurring Monthly Cash Flow
    const recurringMonthlyCashFlow = monthlyRent - totalRecurringMonthlyExpenses;
    const annualRecurringCashFlow = recurringMonthlyCashFlow * 12;

    // 4. Calculate Periodic Annual Costs
    const annualVacancyCost = monthlyRent * 1; // 1 month vacancy per year
    const annualizedAgentFee = (monthlyRent * 1) / 2; // 1 month rent every 2 years

    // 5. Calculate Final Adjusted Annual Net Cash Flow
    const adjustedAnnualNetCashFlow = annualRecurringCashFlow - annualVacancyCost - annualizedAgentFee;
    
    // 6. Calculate Yields
    const annualRent = monthlyRent * 12;
    const grossYield = (annualRent / purchasePrice) * 100;
    const netYield = (adjustedAnnualNetCashFlow / purchasePrice) * 100;

    // 7. Calculate Cash-on-Cash Return (if leveraged)
    const totalCashDownpayment = purchasePrice - loanAmount;
    const cashOnCashReturn = inputs.isLeveraged ? (adjustedAnnualNetCashFlow / totalCashDownpayment) * 100 : null;

    setResults({
      grossYield,
      netYield,
      cashOnCashReturn,
      recurringMonthlyCashFlow,
      adjustedAnnualNetCashFlow,
      totalCashDownpayment,
      monthlyBreakdown: {
        rent: monthlyRent,
        mortgage: monthlyMortgage,
        propertyTax: monthlyPropertyTax,
        maintenance: monthlyMaintenance,
        sinkingFund: monthlySinkingFund,
        insurance: monthlyInsurance,
      },
      annualBreakdown: {
          recurringCashFlow: annualRecurringCashFlow,
          vacancyCost: annualVacancyCost,
          agentFee: annualizedAgentFee
      }
    });
  };

  const isFormValid = inputs.purchasePrice && inputs.monthlyRent;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg border-l-4 border-green-500">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <TrendingUp className="w-5 h-5" />
          Comprehensive Investment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price (S$)</Label>
                  <Input id="purchasePrice" type="number" placeholder="e.g. 1200000" value={inputs.purchasePrice} onChange={(e) => handleInputChange('purchasePrice', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">Monthly Rent (S$)</Label>
                  <Input id="monthlyRent" type="number" placeholder="e.g. 4000" value={inputs.monthlyRent} onChange={(e) => handleInputChange('monthlyRent', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualValue">Property Annual Value (AV)</Label>
                  <Input id="annualValue" type="number" placeholder="e.g. 42000" value={inputs.annualValue} onChange={(e) => handleInputChange('annualValue', e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label>Property Tax Status</Label>
                    <Select value={inputs.propertyTaxStatus} onValueChange={(value) => handleInputChange('propertyTaxStatus', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select tax status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="rented">Rented Out (Investment)</SelectItem>
                            <SelectItem value="owner-occupied">Owner-Occupied</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyMaintenance">Monthly Maintenance (S$)</Label>
                  <Input id="monthlyMaintenance" type="number" placeholder="e.g. 300" value={inputs.monthlyMaintenance} onChange={(e) => handleInputChange('monthlyMaintenance', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlySinkingFund">Monthly Sinking Fund (S$)</Label>
                  <Input id="monthlySinkingFund" type="number" placeholder="e.g. 50" value={inputs.monthlySinkingFund} onChange={(e) => handleInputChange('monthlySinkingFund', e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="annualInsurance">Annual Fire Insurance (S$)</Label>
                  <Input id="annualInsurance" type="number" placeholder="e.g. 301" value={inputs.annualInsurance} onChange={(e) => handleInputChange('annualInsurance', e.target.value)} />
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border">
                    <p className="text-sm font-medium text-slate-600">Calculated Annual Property Tax</p>
                    <p className="text-lg font-bold text-slate-800">{formatCurrency(calculatePropertyTax)}</p>
                </div>
            </div>
          </div>
          
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="isLeveraged" checked={inputs.isLeveraged} onCheckedChange={(checked) => handleInputChange('isLeveraged', checked)} />
              <Label htmlFor="isLeveraged">Leveraged Purchase (Using Mortgage)</Label>
            </div>
            {inputs.isLeveraged && (
              <div className="grid md:grid-cols-3 gap-4 pl-6 border-l-2 border-green-200">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount (S$)</Label>
                  <Input id="loanAmount" type="number" placeholder="e.g. 500000" value={inputs.loanAmount} onChange={(e) => handleInputChange('loanAmount', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (% p.a.)</Label>
                  <Input id="interestRate" type="number" step="0.1" placeholder="e.g. 3.5" value={inputs.interestRate} onChange={(e) => handleInputChange('interestRate', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanTenure">Loan Tenure (Years)</Label>
                  <Input id="loanTenure" type="number" placeholder="e.g. 25" value={inputs.loanTenure} onChange={(e) => handleInputChange('loanTenure', e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <Button onClick={calculateYields} disabled={!isFormValid} className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-medium">
            <Calculator className="w-4 h-4 mr-2" />
            Analyze Investment
          </Button>

          {results && (
            <div className="space-y-6 pt-6 border-t border-slate-200">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border">
                  <h5 className="font-medium text-blue-800">Gross Rental Yield</h5>
                  <p className="text-2xl font-bold text-blue-700">{formatPercentage(results.grossYield)}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border">
                   <h5 className="font-medium text-emerald-800">Net Rental Yield</h5>
                  <p className="text-2xl font-bold text-emerald-700">{formatPercentage(results.netYield)}</p>
                </div>
                <div className={`bg-gradient-to-br p-4 rounded-lg border ${results.recurringMonthlyCashFlow >= 0 ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'}`}>
                   <h5 className={`font-medium ${results.recurringMonthlyCashFlow >= 0 ? 'text-green-800' : 'text-red-800'}`}>Recurring Monthly Cash Flow</h5>
                  <p className={`text-2xl font-bold ${results.recurringMonthlyCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(results.recurringMonthlyCashFlow)}</p>
                </div>
              </div>

              {results.cashOnCashReturn && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border">
                  <h5 className="font-medium text-purple-800 text-center">Cash-on-Cash Return</h5>
                  <p className="text-3xl font-bold text-purple-700 text-center">{formatPercentage(results.cashOnCashReturn)}</p>
                  <p className="text-sm text-purple-600 text-center mt-1">Based on {formatCurrency(results.totalCashDownpayment)} downpayment</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800">Recurring Monthly Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-800">Rental Income</span>
                      <span className="font-bold text-green-700">{formatCurrency(results.monthlyBreakdown.rent)}</span>
                    </div>
                    <p className="font-medium text-slate-700 mb-2">(-) Recurring Expenses:</p>
                    <div className="space-y-1 pl-4">
                      {inputs.isLeveraged && <div className="flex justify-between"><span>Mortgage Payment</span><span className="text-red-600 font-medium">{formatCurrency(results.monthlyBreakdown.mortgage)}</span></div>}
                      <div className="flex justify-between"><span>Property Tax ({inputs.propertyTaxStatus === 'owner-occupied' ? 'Owner-Occ' : 'Investment'})</span><span className="text-red-600 font-medium">{formatCurrency(results.monthlyBreakdown.propertyTax)}</span></div>
                      <div className="flex justify-between"><span>Maintenance</span><span className="text-red-600 font-medium">{formatCurrency(results.monthlyBreakdown.maintenance)}</span></div>
                      <div className="flex justify-between"><span>Sinking Fund</span><span className="text-red-600 font-medium">{formatCurrency(results.monthlyBreakdown.sinkingFund)}</span></div>
                      <div className="flex justify-between"><span>Insurance</span><span className="text-red-600 font-medium">{formatCurrency(results.monthlyBreakdown.insurance)}</span></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800">Adjusted Annual Cash Flow</h4>
                  <div className="space-y-2 text-sm">
                     <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-800">Annual Recurring Cash Flow</span>
                        <span className="font-bold text-slate-700">{formatCurrency(results.annualBreakdown.recurringCashFlow)}</span>
                    </div>
                    <p className="font-medium text-slate-700 mb-2">(-) Periodic & Contingency Costs:</p>
                     <div className="space-y-1 pl-4">
                        <div className="flex justify-between">
                            <span>Vacancy Cost (1 month/yr)</span>
                            <span className="text-red-600 font-medium">{formatCurrency(results.annualBreakdown.vacancyCost)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Agent Fee (Annualized)</span>
                            <span className="text-red-600 font-medium">{formatCurrency(results.annualBreakdown.agentFee)}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-t-2 mt-2">
                        <span className="font-bold text-blue-800">Adjusted Annual Net Cash Flow</span>
                        <span className={`font-bold text-lg ${results.adjustedAnnualNetCashFlow >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{formatCurrency(results.adjustedAnnualNetCashFlow)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h6 className="font-medium text-purple-800 mb-2">Final Verdict</h6>
                <div className="text-sm text-purple-700 space-y-1">
                  {results.netYield >= 2.5 ? <p>✅ <strong>Strong Net Yield ({formatPercentage(results.netYield)}):</strong> Indicates a potentially profitable long-term investment after accounting for all major costs.</p> : results.netYield >= 1.5 ? <p>⚠️ <strong>Moderate Net Yield ({formatPercentage(results.netYield)}):</strong> The returns are positive but may be tight. Capital appreciation will be a key factor for overall profit.</p> : <p>❌ <strong>Low Net Yield ({formatPercentage(results.netYield)}):</strong> The rental income may not be sufficient to cover costs. This investment would heavily rely on strong capital appreciation to be worthwhile.</p>}
                  {results.recurringMonthlyCashFlow >= 0 ? <p>✅ <strong>Positive Recurring Cash Flow:</strong> The property can sustain its own recurring monthly costs, which is a very healthy sign.</p> : <p>📉 <strong>Negative Recurring Cash Flow:</strong> You will need to top up cash ({formatCurrency(Math.abs(results.recurringMonthlyCashFlow))}) every month to cover recurring expenses. Ensure you have sufficient holding power.</p>}
                  {results.cashOnCashReturn && <p>💰 <strong>Cash-on-Cash Return:</strong> {formatPercentage(results.cashOnCashReturn)} annual return on your {formatCurrency(results.totalCashDownpayment)} cash investment.</p>}
                  {inputs.propertyTaxStatus === 'owner-occupied' && <p>🏠 <strong>Owner-Occupied Advantage:</strong> You benefit from lower property tax rates while generating rental income from spare rooms.</p>}
                </div>
              </div>
            </div>
          )}

          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Note:</strong> This analysis uses standard assumptions. Agent fees, vacancy, and tax AV can vary. Always conduct your own due diligence.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}