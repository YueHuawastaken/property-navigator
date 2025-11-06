
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { TrendingUp, FileText, Wallet, Calculator, AlertTriangle, AlertCircle, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TooltipInfo from "./TooltipInfo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DisclaimerCard from "./DisclaimerCard";

const COLORS = ['#2563eb', '#0ea5e9', '#06b6d4', '#14b8a6'];

export default function ResultsDashboard({ results, formData }) {
  const { loanEligibility, stampDuties, affordability, grants } = results;

  const pieData = [
    { name: 'Downpayment', value: affordability.totalDownpayment, color: COLORS[0] },
    { name: 'Stamp Duties', value: stampDuties.total, color: COLORS[1] },
    { name: 'Other Costs (Legal)', value: affordability.legalFees, color: COLORS[2] },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer - Always at top */}
      <DisclaimerCard />

      {/* Foreigner LDAU Warning */}
      {formData.citizenship === 'foreigner' && (formData.propertyType === 'landed') && (
        <Alert variant="destructive" className="shadow-lg border-red-500 bg-red-50">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-bold">LDAU Approval Required</AlertTitle>
          <AlertDescription>
            As a foreigner purchasing landed property, you require LDAU (Land Dealings Approval Unit) approval. This calculator assumes approval is granted.
          </AlertDescription>
        </Alert>
      )}

      {/* Affordability Warning */}
      {affordability.shortfallWarning && (
        <Alert variant="destructive" className="shadow-lg border-red-500 bg-red-50">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-bold">Affordability Warning</AlertTitle>
          <AlertDescription>
            {affordability.shortfallWarning}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Loan Eligibility */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-t-lg border-l-4 border-emerald-500">
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <TrendingUp className="w-5 h-5" />
            Maximum Eligible Loan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-600">Based on TDSR (55%) & LTV</p>
              <TooltipInfo content="Total Debt Servicing Ratio (TDSR) limits your monthly debt repayments to 55% of your income. Loan-to-Value (LTV) limits the loan amount based on property value." />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(affordability.loanAmount)}
            </p>
            <p className="text-sm text-slate-600">
              Your maximum loan from TDSR is {formatCurrency(loanEligibility.maxLoan)}, while your LTV limit is {formatCurrency(affordability.ltvLoanLimit)}. The lower of the two is used.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stamp Duties */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg border-l-4 border-orange-500">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <FileText className="w-5 h-5" />
            Stamp Duties
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Buyer's Stamp Duty (BSD)</p>
                <p className="text-xl font-semibold text-slate-900">{formatCurrency(stampDuties.bsd)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-slate-600">Additional BSD (ABSD)</p>
                  <TooltipInfo content="Additional tax applied based on citizenship and property count" />
                </div>
                <p className="text-xl font-semibold text-slate-900">{formatCurrency(stampDuties.absd)}</p>
                <p className="text-xs text-slate-500 mt-1">Rate: {stampDuties.absdRate}%</p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200">
              <p className="text-lg font-bold text-slate-900">
                Total Stamp Duties: {formatCurrency(stampDuties.total)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upfront Payment Breakdown */}
      <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg border-l-4 border-blue-500">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Wallet className="w-5 h-5" />
              Upfront Payment Breakdown (Cash & CPF)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Total Upfront Cash */}
              <div className="text-center bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Total Upfront Cash Required</p>
                  <p className="text-4xl font-extrabold text-blue-600 my-2">{formatCurrency(affordability.totalUpfrontCashRequired)}</p>
              </div>

              {/* Cash Breakdown */}
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold text-slate-700">Cash Breakdown:</h4>
                <div className="flex justify-between"><span>Downpayment (Cash Portion)</span><span className="font-medium">{formatCurrency(affordability.totalCashForDownpayment)}</span></div>
                <div className="flex justify-between"><span>Buyer's Stamp Duty (BSD)</span><span className="font-medium">{formatCurrency(stampDuties.bsd)}</span></div>
                <div className="flex justify-between"><span>Additional BSD (ABSD)</span><span className="font-medium">{formatCurrency(stampDuties.absd)}</span></div>
                <div className="flex justify-between"><span>Legal Fees (Est.)</span><span className="font-medium">{formatCurrency(affordability.legalFees)}</span></div>
              </div>
              
              {/* CPF Usage */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <h4 className="font-semibold text-slate-700">CPF OA Usage:</h4>
                <div className="flex justify-between"><span>Downpayment (CPF Portion)</span><span className="font-medium">{formatCurrency(affordability.actualCpfUsed)}</span></div>
              </div>

               {/* Total Outlay */}
              <div className="border-t-2 border-blue-200 pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-slate-900">Total Initial Outlay</span>
                  <span className="font-bold text-blue-700">{formatCurrency(affordability.totalInitialOutlay)}</span>
                </div>
                 <p className="text-xs text-slate-500 text-right">(Total Cash + Total CPF Used)</p>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Cost Distribution Pie Chart */}
      <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg border-l-4 border-purple-500">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Calculator className="w-5 h-5" />
              Initial Outlay Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      {/* Potential Grants */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg border-l-4 border-green-500">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Gift className="w-5 h-5" />
            Potential Grants
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {grants.length > 0 ? (
            <div className="space-y-3">
              {grants.map((grant, index) => (
                <div key={index} className="flex items-start gap-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mt-1 flex-shrink-0">
                    Info
                  </Badge>
                  <p className="text-sm text-slate-700">{grant}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Select a property type to see potential grant eligibility.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
