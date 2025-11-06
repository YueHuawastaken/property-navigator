import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Banknote, Percent, Calendar, AlertCircle, AlertTriangle } from "lucide-react";

// Updated simulated data as live APIs are unavailable
const SORA_3M = 3.05; // Updated sample 3-month SORA rate for realism
const bankLoans = [
  { bank: "DBS", type: "Fixed", rate: 2.75, fixedDuration: '2-3', subsequent: `3M SORA + 0.80%` },
  { bank: "DBS", type: "Floating", rate: SORA_3M + 0.80, spread: 0.80, subsequent: `3M SORA + 0.80%` },
  { bank: "OCBC", type: "Fixed", rate: 2.40, fixedDuration: 3, subsequent: `3M SORA + 0.80%` },
  { bank: "OCBC", type: "Floating", rate: SORA_3M + 0.80, spread: 0.80, subsequent: `3M SORA + 0.80%` },
  { bank: "UOB", type: "Fixed", rate: 2.85, fixedDuration: 3, subsequent: `3M SORA + 0.80%` },
  { bank: "UOB", type: "Floating", rate: SORA_3M + 0.80, spread: 0.80, subsequent: `3M SORA + 0.80%` },
  { bank: "HSBC", type: "Fixed", rate: 3.75, fixedDuration: '2-3', subsequent: `3M SORA + 0.65%` },
  { bank: "HSBC", type: "Floating", rate: SORA_3M + 0.65, spread: 0.65, subsequent: `3M SORA + 0.65%` },
];

export default function LoanComparisonTool({ initialLoanAmount }) {
  const [loanAmount, setLoanAmount] = useState("500000");
  const [loanTenure, setLoanTenure] = useState("25");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [propertyType, setPropertyType] = useState("");
  
  useEffect(() => {
    if (initialLoanAmount && initialLoanAmount > 0) {
      setLoanAmount(initialLoanAmount.toString());
    }
  }, [initialLoanAmount]);

  const calculateMonthlyRepayment = (principal, annualRate, tenureYears) => {
    if (principal <= 0 || annualRate <= 0 || tenureYears <= 0) return 0;
    const monthlyRate = (annualRate / 100) / 12;
    const numberOfPayments = tenureYears * 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    return monthlyPayment;
  };

  // Check if MSR applies (only for HDB and EC)
  const msrApplies = propertyType === 'hdb' || propertyType === 'ec';
  const msrLimit = parseFloat(monthlyIncome) * 0.30;

  const loanComparisons = useMemo(() => {
    const principal = parseFloat(loanAmount) || 0;
    const tenure = parseFloat(loanTenure) || 0;
    
    return bankLoans.map(loan => {
      const monthlyRepayment = calculateMonthlyRepayment(principal, loan.rate, tenure);
      const exceedsMSR = msrApplies && monthlyIncome && monthlyRepayment > msrLimit;
      
      return {
        ...loan,
        monthlyRepayment,
        exceedsMSR
      };
    }).sort((a, b) => a.monthlyRepayment - b.monthlyRepayment); // Sort by lowest monthly payment
  }, [loanAmount, loanTenure, msrApplies, monthlyIncome, msrLimit]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(amount);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg border-l-4 border-purple-500">
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Banknote className="w-5 h-5" />
          Loan Comparison Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loanAmount" className="text-sm font-medium text-slate-700">
                Loan Amount (S$)
              </Label>
              <Input
                id="loanAmount"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="border-slate-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanTenure" className="text-sm font-medium text-slate-700">
                Loan Tenure (Years)
              </Label>
              <Input
                id="loanTenure"
                type="number"
                value={loanTenure}
                onChange={(e) => setLoanTenure(e.target.value)}
                className="border-slate-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome" className="text-sm font-medium text-slate-700">
                Gross Monthly Income (S$)
              </Label>
              <Input
                id="monthlyIncome"
                type="number"
                placeholder="e.g. 8000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="border-slate-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="border-slate-300 focus:border-purple-500">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hdb">HDB Resale</SelectItem>
                  <SelectItem value="ec">Executive Condo (EC)</SelectItem>
                  <SelectItem value="condo">Private Condo</SelectItem>
                  <SelectItem value="landed">Landed Property</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* MSR Information Alert */}
          {msrApplies && monthlyIncome && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>MSR Limit:</strong> For {propertyType.toUpperCase()} properties, monthly loan repayment cannot exceed 30% of gross monthly income = {formatCurrency(msrLimit)}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Results Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Indicative Rate</TableHead>
                  <TableHead>Monthly Repayment</TableHead>
                  {msrApplies && monthlyIncome && <TableHead>MSR Check</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loanComparisons.map((loan, index) => (
                  <TableRow key={index} className={index === 0 ? "bg-green-50" : ""}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {loan.bank}
                      {index === 0 && <Badge variant="secondary" className="bg-green-200 text-green-800">Lowest</Badge>}
                    </TableCell>
                    <TableCell>
                      {loan.type === "Fixed" ? (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Fixed</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Floating</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="font-semibold">{loan.rate.toFixed(2)}%</p>
                          <p className="text-xs text-slate-500">
                            {loan.type === "Fixed" 
                              ? `For ${loan.fixedDuration} years` 
                              : `3M SORA (${SORA_3M.toFixed(2)}%) + ${loan.spread.toFixed(2)}%`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-lg font-bold text-purple-700">{formatCurrency(loan.monthlyRepayment)}</p>
                    </TableCell>
                    {msrApplies && monthlyIncome && (
                      <TableCell>
                        {loan.exceedsMSR ? (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <Badge variant="destructive" className="bg-red-100 text-red-700">Exceeds MSR</Badge>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">Within MSR</Badge>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* MSR Exceeded Warning */}
          {msrApplies && monthlyIncome && loanComparisons.some(loan => loan.exceedsMSR) && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                <strong>MSR Caution:</strong> Some loan options exceed the 30% MSR limit for {propertyType.toUpperCase()} properties. 
                You may not qualify for these loans or may need to reduce the loan amount.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Disclaimer */}
          <Alert variant="default" className="bg-slate-50 border-slate-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm text-slate-600">
              Rates are indicative only and based on a sample 3M SORA of {SORA_3M.toFixed(2)}%. 
              MSR applies only to HDB and EC properties. For latest rates and promotions, please check directly with banks.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}