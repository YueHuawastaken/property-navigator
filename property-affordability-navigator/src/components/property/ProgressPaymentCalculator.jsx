import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building, ListOrdered, Info } from "lucide-react";

const bucSchedule = [
  { milestone: "Upon Option Fee & Signing of S&P Agreement", percentage: 10 },
  { milestone: "During Construction", percentage: 60 },
  { milestone: "Upon Temporary Occupation Permit (TOP)", percentage: 15 },
  { milestone: "Upon Certificate of Statutory Completion (CSC)", percentage: 5 },
  { milestone: "Final Payment (after 12-month defect liability period)", percentage: 10 }
];

export default function ProgressPaymentCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [schedule, setSchedule] = useState([]);

  const calculateSchedule = () => {
    const price = parseFloat(purchasePrice) || 0;
    if (price <= 0) {
      setSchedule([]);
      return;
    }

    let cumulativeAmount = 0;
    const calculatedSchedule = bucSchedule.map(item => {
      const paymentAmount = price * (item.percentage / 100);
      cumulativeAmount += paymentAmount;
      return {
        ...item,
        paymentAmount,
        cumulativeAmount,
      };
    });
    setSchedule(calculatedSchedule);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', minimumFractionDigits: 0 }).format(amount);
  };

  // Calculate total percentage for validation
  const totalPercentage = bucSchedule.reduce((sum, item) => sum + item.percentage, 0);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-t-lg border-l-4 border-cyan-500">
        <CardTitle className="flex items-center gap-2 text-cyan-800 text-lg sm:text-xl">
          <Building className="w-5 h-5 flex-shrink-0" />
          <span>Progress Payment Calculator (BUC)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Input Section */}
        <div className="flex flex-col gap-4">
          <div className="space-y-2 w-full">
            <Label htmlFor="bucPurchasePrice" className="text-sm font-medium">Purchase Price (S$)</Label>
            <Input
              id="bucPurchasePrice"
              type="number"
              placeholder="e.g. 1300000"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="text-base"
            />
          </div>
          <Button 
            onClick={calculateSchedule} 
            className="w-full bg-cyan-600 hover:bg-cyan-700 py-3 text-base font-medium"
          >
            <ListOrdered className="w-4 h-4 mr-2 flex-shrink-0" />
            Generate Schedule
          </Button>
        </div>

        {schedule.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {/* Payment Summary Box - Mobile Responsive Grid */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 text-base sm:text-lg">Payment Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 text-sm">
                <div className="text-center sm:text-left">
                  <p className="text-blue-600 font-medium">Initial Payment</p>
                  <p className="text-xs text-blue-500 mb-1">(10%)</p>
                  <p className="font-bold text-blue-800 text-lg">{formatCurrency(parseFloat(purchasePrice) * 0.10)}</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-blue-600 font-medium">Construction</p>
                  <p className="text-xs text-blue-500 mb-1">(60%)</p>
                  <p className="font-bold text-blue-800 text-lg">{formatCurrency(parseFloat(purchasePrice) * 0.60)}</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-blue-600 font-medium">TOP Payment</p>
                  <p className="text-xs text-blue-500 mb-1">(15%)</p>
                  <p className="font-bold text-blue-800 text-lg">{formatCurrency(parseFloat(purchasePrice) * 0.15)}</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-blue-600 font-medium">CSC Payment</p>
                  <p className="text-xs text-blue-500 mb-1">(5%)</p>
                  <p className="font-bold text-blue-800 text-lg">{formatCurrency(parseFloat(purchasePrice) * 0.05)}</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-blue-600 font-medium">Final Payment</p>
                  <p className="text-xs text-blue-500 mb-1">(10%)</p>
                  <p className="font-bold text-blue-800 text-lg">{formatCurrency(parseFloat(purchasePrice) * 0.10)}</p>
                </div>
              </div>
            </div>

            {/* Mobile-First Table Design */}
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[250px]">Payment Stage</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                      <TableHead className="text-right">Payment Amount</TableHead>
                      <TableHead className="text-right">Cumulative Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.map((item, index) => (
                      <TableRow 
                        key={index} 
                        className={
                          index === 0 ? "bg-blue-50" : 
                          index === 1 ? "bg-orange-50" : 
                          index >= 2 && index <= 3 ? "bg-green-50" : 
                          index === 4 ? "bg-amber-50" : ""
                        }
                      >
                        <TableCell className="font-medium">{item.milestone}</TableCell>
                        <TableCell className="text-right">{item.percentage}%</TableCell>
                        <TableCell className="text-right font-semibold text-cyan-700">
                          {formatCurrency(item.paymentAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.cumulativeAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 border-cyan-200 bg-cyan-50">
                      <TableCell className="font-bold">TOTAL</TableCell>
                      <TableCell className="text-right font-bold">{totalPercentage}%</TableCell>
                      <TableCell className="text-right font-bold text-cyan-800">
                        {formatCurrency(parseFloat(purchasePrice))}
                      </TableCell>
                      <TableCell className="text-right font-bold text-cyan-800">
                        {formatCurrency(parseFloat(purchasePrice))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card Layout */}
              <div className="sm:hidden space-y-3">
                {schedule.map((item, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      index === 0 ? "bg-blue-50 border-blue-400" : 
                      index === 1 ? "bg-orange-50 border-orange-400" : 
                      index >= 2 && index <= 3 ? "bg-green-50 border-green-400" : 
                      index === 4 ? "bg-amber-50 border-amber-400" : "bg-gray-50 border-gray-400"
                    }`}
                  >
                    <h5 className="font-semibold text-gray-800 text-sm mb-2 leading-snug">
                      {item.milestone}
                    </h5>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-600 mb-1">Percentage</p>
                        <p className="font-bold text-cyan-700">{item.percentage}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Payment</p>
                        <p className="font-bold text-cyan-700 text-xs">
                          {formatCurrency(item.paymentAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Cumulative</p>
                        <p className="font-bold text-gray-800 text-xs">
                          {formatCurrency(item.cumulativeAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mobile Total Card */}
                <div className="p-4 rounded-lg bg-cyan-100 border-l-4 border-cyan-500">
                  <h5 className="font-bold text-cyan-800 text-base mb-2">TOTAL</h5>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-cyan-700 mb-1">Percentage</p>
                      <p className="font-bold text-cyan-800">{totalPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-cyan-700 mb-1">Total Payment</p>
                      <p className="font-bold text-cyan-800 text-sm">
                        {formatCurrency(parseFloat(purchasePrice))}
                      </p>
                    </div>
                    <div>
                      <p className="text-cyan-700 mb-1">Final Total</p>
                      <p className="font-bold text-cyan-800 text-sm">
                        {formatCurrency(parseFloat(purchasePrice))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <Alert className="bg-slate-50 border-slate-200">
          <Info className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
          <AlertDescription className="text-slate-700 text-sm leading-relaxed">
            This schedule reflects the standard BUC payment structure under the Housing Developers (Control and Licensing) Act. The final 10% is retained until after the 12-month defect liability period concludes.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}