
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Calculator, AlertTriangle, ChevronsRight, Calendar, Home, Info } from "lucide-react";

const COLORS = ['#ef4444', '#f97316', '#a855f7', '#22c55e', '#8b5cf6', '#06b6d4']; // Added color for SSD and HDB costs

const resaleLevyRates = {
  "2-room": 15000,
  "3-room": 30000,
  "4-room": 40000,
  "5-room": 45000,
  "executive": 50000,
  "ec": 55000,
};

export default function SellersNetProceedsCalculator() {
  const [inputs, setInputs] = useState({
    sellingPrice: "",
    outstandingLoan: "",
    cpfUsed: "",
    yearsOwned: "",
    agentCommission: "2",
    legalFees: "3000",
    purchasedWithinThreeYears: "",
    purchaseDate: "",
    // HDB-specific fields
    buyingNewHdbFlat: "",
    firstFlatType: "",
    hasUpgradingCosts: "",
    upgradingCostAmount: "",
  });
  const [results, setResults] = useState(null);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Auto-calculate CPF refund whenever cpfUsed or yearsOwned changes
  const cpfRefundData = useMemo(() => {
    const cpfUsed = parseFloat(inputs.cpfUsed) || 0;
    const yearsOwned = parseFloat(inputs.yearsOwned) || 0;
    
    if (cpfUsed === 0 || yearsOwned === 0) {
      return {
        principal: 0,
        accruedInterest: 0,
        totalRefund: 0
      };
    }

    const totalRefund = cpfUsed * Math.pow(1 + 0.025, yearsOwned);
    const accruedInterest = totalRefund - cpfUsed;

    return {
      principal: cpfUsed,
      accruedInterest: accruedInterest,
      totalRefund: totalRefund
    };
  }, [inputs.cpfUsed, inputs.yearsOwned]);

  // Calculate Seller's Stamp Duty (SSD) if applicable
  const ssdData = useMemo(() => {
    if (inputs.purchasedWithinThreeYears !== "yes" || !inputs.purchaseDate || !inputs.sellingPrice) {
      return { rate: 0, amount: 0, applicable: false };
    }

    const purchaseDate = new Date(inputs.purchaseDate);
    const saleDate = new Date(); // Current date as sale date
    const holdingPeriodYears = (saleDate - purchaseDate) / (365.25 * 24 * 60 * 60 * 1000);
    const sellingPrice = parseFloat(inputs.sellingPrice) || 0;

    let ssdRate = 0;
    if (holdingPeriodYears < 1) {
      ssdRate = 12;
    } else if (holdingPeriodYears < 2) {
      ssdRate = 8;
    } else if (holdingPeriodYears < 3) {
      ssdRate = 4;
    }

    const ssdAmount = sellingPrice * (ssdRate / 100);

    return {
      rate: ssdRate,
      amount: ssdAmount,
      applicable: ssdRate > 0,
      holdingPeriodYears: holdingPeriodYears
    };
  }, [inputs.purchasedWithinThreeYears, inputs.purchaseDate, inputs.sellingPrice]);

  // Calculate Resale Levy (informational only)
  const resaleLevyData = useMemo(() => {
    if (inputs.buyingNewHdbFlat === "yes" && inputs.firstFlatType) {
      return {
        applicable: true,
        amount: resaleLevyRates[inputs.firstFlatType] || 0,
        flatType: inputs.firstFlatType
      };
    }
    return { applicable: false, amount: 0 };
  }, [inputs.buyingNewHdbFlat, inputs.firstFlatType]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', minimumFractionDigits: 0 }).format(amount < 0 ? 0 : amount);
  };

  const calculateProceeds = () => {
    const sellingPrice = parseFloat(inputs.sellingPrice) || 0;
    const outstandingLoan = parseFloat(inputs.outstandingLoan) || 0;
    const agentCommission = parseFloat(inputs.agentCommission) || 0;
    const legalFees = parseFloat(inputs.legalFees) || 0;
    const upgradingCosts = inputs.hasUpgradingCosts === "yes" ? (parseFloat(inputs.upgradingCostAmount) || 0) : 0;


    if (sellingPrice <= 0) {
      setResults(null);
      return;
    }

    const agentFeeAmount = sellingPrice * (agentCommission / 100);
    const totalDeductions = outstandingLoan + cpfRefundData.totalRefund + agentFeeAmount + legalFees + ssdData.amount + upgradingCosts;
    const netCashProceeds = sellingPrice - totalDeductions;

    // Filter out items with zero value for cleaner chart and legend
    const pieData = [
      { name: "Loan Repayment", value: outstandingLoan },
      { name: "CPF Refund", value: cpfRefundData.totalRefund },
      { name: "Fees (Agent/Legal)", value: agentFeeAmount + legalFees },
      ...(ssdData.applicable ? [{ name: "Seller's Stamp Duty", value: ssdData.amount }] : []),
      ...(upgradingCosts > 0 ? [{ name: "Upgrading Costs", value: upgradingCosts }] : []),
      { name: "Cash Proceeds", value: Math.max(0, netCashProceeds) },
    ].filter(item => item.value > 0);

    setResults({
      agentFeeAmount,
      netCashProceeds,
      pieData,
      upgradingCosts,
    });
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-t-lg border-l-4 border-rose-500">
        <CardTitle className="flex items-center gap-2 text-rose-800">
          <Calculator className="w-5 h-5" />
          Seller's Net Proceeds Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price (S$)</Label>
              <Input id="sellingPrice" type="number" value={inputs.sellingPrice} onChange={(e) => handleInputChange('sellingPrice', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outstandingLoan">Outstanding Mortgage Loan (S$)</Label>
              <Input id="outstandingLoan" type="number" value={inputs.outstandingLoan} onChange={(e) => handleInputChange('outstandingLoan', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpfUsed">Total CPF Principal Used (S$)</Label>
              <Input id="cpfUsed" type="number" value={inputs.cpfUsed} onChange={(e) => handleInputChange('cpfUsed', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsOwned">Years Property Owned</Label>
              <Input id="yearsOwned" type="number" step="0.1" value={inputs.yearsOwned} onChange={(e) => handleInputChange('yearsOwned', e.target.value)} />
            </div>
          </div>
          <div className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="agentCommission">Agent Commission (%)</Label>
              <Input id="agentCommission" type="number" value={inputs.agentCommission} onChange={(e) => handleInputChange('agentCommission', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legalFees">Legal Fees (S$)</Label>
              <Input id="legalFees" type="number" value={inputs.legalFees} onChange={(e) => handleInputChange('legalFees', e.target.value)} />
            </div>
            
            {/* SSD Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Was this property purchased within the last 3 years?</Label>
                <RadioGroup
                  value={inputs.purchasedWithinThreeYears}
                  onValueChange={(value) => handleInputChange('purchasedWithinThreeYears', value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="ssd-yes" />
                    <Label htmlFor="ssd-yes" className="text-sm">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="ssd-no" />
                    <Label htmlFor="ssd-no" className="text-sm">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {inputs.purchasedWithinThreeYears === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate" className="text-sm font-medium text-slate-700">
                    Property Purchase Date
                  </Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={inputs.purchaseDate}
                    onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                    className="border-slate-300 focus:border-rose-500"
                  />
                  {ssdData.applicable && (
                    <div className="bg-red-50 p-2 rounded border border-red-200">
                      <p className="text-xs text-red-700">
                        Holding Period: {ssdData.holdingPeriodYears.toFixed(1)} years
                        <br />
                        SSD Rate: {ssdData.rate}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HDB-Specific Costs Section */}
        <div className="border-t-2 border-slate-200 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-800">HDB-Specific Costs (Optional)</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Resale Levy Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Are you planning to buy another new subsidised flat from HDB (e.g., BTO, SBF) after this sale?
                </Label>
                <RadioGroup
                  value={inputs.buyingNewHdbFlat}
                  onValueChange={(value) => handleInputChange('buyingNewHdbFlat', value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="hdb-yes" />
                    <Label htmlFor="hdb-yes" className="text-sm">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="hdb-no" />
                    <Label htmlFor="hdb-no" className="text-sm">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {inputs.buyingNewHdbFlat === "yes" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    What was the flat type of your first subsidised flat?
                  </Label>
                  <Select value={inputs.firstFlatType} onValueChange={(value) => handleInputChange('firstFlatType', value)}>
                    <SelectTrigger className="border-slate-300 focus:border-rose-500">
                      <SelectValue placeholder="Please select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2-room">2-room → Levy: S$15,000</SelectItem>
                      <SelectItem value="3-room">3-room → Levy: S$30,000</SelectItem>
                      <SelectItem value="4-room">4-room → Levy: S$40,000</SelectItem>
                      <SelectItem value="5-room">5-room → Levy: S$45,000</SelectItem>
                      <SelectItem value="executive">Executive / Multi-Generation → Levy: S$50,000</SelectItem>
                      <SelectItem value="ec">Executive Condominium (EC) → Levy: S$55,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Upgrading Costs Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Have you received an invoice from HDB for upgrading works (e.g., Main Upgrading Programme - MUP) that you have not yet paid?
                </Label>
                <p className="text-xs text-slate-500">
                  (This cost is payable by the owner at the time of billing. You must settle it before the sale can be completed.)
                </p>
                <RadioGroup
                  value={inputs.hasUpgradingCosts}
                  onValueChange={(value) => handleInputChange('hasUpgradingCosts', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="upgrade-yes" />
                    <Label htmlFor="upgrade-yes" className="text-sm">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="upgrade-no" />
                    <Label htmlFor="upgrade-no" className="text-sm">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unsure" id="upgrade-unsure" />
                    <Label htmlFor="upgrade-unsure" className="text-sm">I'm not sure</Label>
                  </div>
                </RadioGroup>
              </div>

              {inputs.hasUpgradingCosts === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="upgradingCostAmount" className="text-sm font-medium text-slate-700">
                    Outstanding Upgrading Cost amount from your HDB bill (S$)
                  </Label>
                  <Input
                    id="upgradingCostAmount"
                    type="number"
                    placeholder="e.g. 15000"
                    value={inputs.upgradingCostAmount}
                    onChange={(e) => handleInputChange('upgradingCostAmount', e.target.value)}
                    className="border-slate-300 focus:border-rose-500"
                  />
                </div>
              )}

              {inputs.hasUpgradingCosts === "unsure" && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm">
                    We recommend you check with HDB or your solicitor. Unpaid upgrading costs must be settled before the sale is completed and will be deducted from your proceeds.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          
          <Button onClick={calculateProceeds} className="w-full mt-6 bg-rose-600 hover:bg-rose-700">
            <ChevronsRight className="w-4 h-4 mr-2" /> Calculate Net Proceeds
          </Button>
        </div>

        {/* Auto-Calculated CPF Refund Display */}
        {(parseFloat(inputs.cpfUsed) > 0 && parseFloat(inputs.yearsOwned) > 0) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Mandatory CPF Refund (Auto-Calculated)
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-orange-600 font-medium">CPF Principal</p>
                <p className="text-lg font-bold text-orange-800">{formatCurrency(cpfRefundData.principal)}</p>
              </div>
              <div className="text-center">
                <p className="text-orange-600 font-medium">Accrued Interest (2.5% p.a.)</p>
                <p className="text-lg font-bold text-orange-800">{formatCurrency(cpfRefundData.accruedInterest)}</p>
              </div>
              <div className="text-center">
                <p className="text-orange-600 font-medium">Total CPF Refund</p>
                <p className="text-xl font-extrabold text-orange-800">{formatCurrency(cpfRefundData.totalRefund)}</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-orange-700">
              Formula: {formatCurrency(cpfRefundData.principal)} × (1 + 0.025)^{inputs.yearsOwned} = {formatCurrency(cpfRefundData.totalRefund)}
            </div>
          </div>
        )}

        {/* SSD Warning if applicable */}
        {ssdData.applicable && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="font-bold">Seller's Stamp Duty (SSD) Applicable</AlertTitle>
            <AlertDescription className="text-red-800">
              Since you're selling within {ssdData.holdingPeriodYears < 1 ? "1 year" : ssdData.holdingPeriodYears < 2 ? "1-2 years" : "2-3 years"} of purchase, 
              you must pay {ssdData.rate}% SSD = {formatCurrency(ssdData.amount)}
            </AlertDescription>
          </Alert>
        )}

        {/* Resale Levy Information (not deducted from proceeds) */}
        {resaleLevyData.applicable && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="font-bold text-blue-800">Important Note on Resale Levy</AlertTitle>
            <AlertDescription className="text-blue-800">
              You must pay a Resale Levy of <strong>{formatCurrency(resaleLevyData.amount)}</strong> in cash to HDB before you can collect the keys to your next new subsidised flat. Ensure you have budgeted for this from your current sale proceeds.
            </AlertDescription>
          </Alert>
        )}
        
        {results && (
          <div className="pt-6 border-t-2 border-rose-100 space-y-6">
            <div className="text-center bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Estimated Cash Proceeds</p>
                <p className="text-4xl font-extrabold text-green-600 my-2">{formatCurrency(results.netCashProceeds)}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800">Breakdown of Sale Proceeds:</h4>
                    <div className="text-sm space-y-2">
                        <div className="flex justify-between"><span>Selling Price</span><span className="font-medium">{formatCurrency(parseFloat(inputs.sellingPrice))}</span></div>
                        <p className="text-slate-600 font-medium mt-1">(-) Deductions:</p>
                        <div className="flex justify-between pl-4"><span>Outstanding Loan</span><span className="font-medium">{formatCurrency(parseFloat(inputs.outstandingLoan))}</span></div>
                        <div className="flex justify-between pl-4"><span>Mandatory CPF Refund</span><span className="font-medium">{formatCurrency(cpfRefundData.totalRefund)}</span></div>
                        {ssdData.applicable && (
                          <div className="flex justify-between pl-4"><span>Seller's Stamp Duty (SSD)</span><span className="font-medium text-red-600">{formatCurrency(ssdData.amount)}</span></div>
                        )}
                        {results.upgradingCosts > 0 && (
                          <div className="flex justify-between pl-4"><span>Outstanding Upgrading Cost</span><span className="font-medium text-red-600">{formatCurrency(results.upgradingCosts)}</span></div>
                        )}
                        <div className="flex justify-between pl-4"><span>Agent Commission</span><span className="font-medium">{formatCurrency(results.agentFeeAmount)}</span></div>
                        <div className="flex justify-between pl-4"><span>Legal Fees</span><span className="font-medium">{formatCurrency(parseFloat(inputs.legalFees))}</span></div>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <h4 className="font-semibold text-slate-800 mb-4">Sale Proceeds Distribution</h4>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={results.pieData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={80}
                                    innerRadius={25}
                                    paddingAngle={2}
                                >
                                    {results.pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value, name) => [formatCurrency(value), name]}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* Custom Legend */}
                    <div className="grid grid-cols-2 gap-3 mt-4 w-full">
                        {results.pieData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <div className="text-xs">
                                    <p className="font-medium text-slate-700">{entry.name}</p>
                                    <p className="text-slate-500">{formatCurrency(entry.value)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        )}

        <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="font-semibold">Disclaimer</AlertTitle>
            <AlertDescription className="text-sm">
              This calculation is an estimate. The mandatory CPF refund (principal + accrued interest) must be returned to your CPF account before any cash proceeds are released. SSD rates apply to private residential properties sold within 3 years of purchase. For HDB flats, consult with HDB directly for exact Resale Levy and upgrading cost requirements. Always consult with legal and financial professionals for exact figures.
            </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
