
// Singapore Property Purchase Calculations

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

export const calculateLoanEligibility = (annualIncome) => {
  const monthlyIncome = annualIncome / 12;
  const maxDebtService = monthlyIncome * 0.55; // TDSR 55%
  const interestRate = 0.035; // 3.5% annual
  const loanTenure = 25; // 25 years
  
  // Calculate maximum loan using loan payment formula
  const monthlyRate = interestRate / 12;
  const numPayments = loanTenure * 12;
  const maxLoan = maxDebtService * ((Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments)));
  
  return {
    monthlyIncome: monthlyIncome,
    maxDebtService: maxDebtService,
    maxLoan: Math.round(maxLoan)
  };
};

export const calculateStampDuties = (propertyPrice, citizenship, propertyCount) => {
  // Buyer's Stamp Duty (BSD) - Progressive rates
  let bsd = 0;
  if (propertyPrice <= 180000) {
    bsd = propertyPrice * 0.01;
  } else if (propertyPrice <= 360000) {
    bsd = 180000 * 0.01 + (propertyPrice - 180000) * 0.02;
  } else if (propertyPrice <= 1000000) {
    bsd = 180000 * 0.01 + 180000 * 0.02 + (propertyPrice - 360000) * 0.03;
  } else {
    bsd = 180000 * 0.01 + 180000 * 0.02 + 640000 * 0.03 + (propertyPrice - 1000000) * 0.04;
  }

  // Additional Buyer's Stamp Duty (ABSD)
  let absdRate = 0;

  if (citizenship === 'citizen') {
      if (propertyCount === 0) absdRate = 0;
      else if (propertyCount === 1) absdRate = 20;
      else absdRate = 30;
  } else if (citizenship === 'pr') {
      if (propertyCount === 0) absdRate = 5;
      else if (propertyCount === 1) absdRate = 30;
      else absdRate = 35;
  } else if (citizenship === 'foreigner') {
    absdRate = 60;
  }
  
  const absd = propertyPrice * (absdRate / 100);
  
  return {
    bsd: Math.round(bsd),
    absd: Math.round(absd),
    absdRate: absdRate,
    total: Math.round(bsd + absd)
  };
};

export const calculateAffordabilityBreakdown = (data, loanEligibility, stampDuties) => {
  const { propertyPrice, cpfSavings, cashSavings, propertyType } = data;

  // 1. Determine LTV Loan Limit
  let ltvRate;
  switch (propertyType) {
    case 'hdb':
      ltvRate = 0.80;
      break;
    case 'condo':
    case 'ec':
      ltvRate = 0.75;
      break;
    case 'landed':
      ltvRate = 0.75;
      break;
    default:
      ltvRate = 0.75;
  }
  
  const ltvLoanLimit = propertyPrice * ltvRate;

  // 2. Determine Final Loan Amount
  const maxLoan = Math.min(loanEligibility.maxLoan, ltvLoanLimit);

  // 3. Calculate Total Downpayment
  const totalDownpayment = propertyPrice - maxLoan;

  // 4. Split Downpayment into Cash & CPF
  let totalCashForDownpayment = 0;
  let actualCpfUsed = 0;

  if (propertyType === 'condo' || propertyType === 'ec' || propertyType === 'landed') {
    const cashMinimumForDownpayment = propertyPrice * 0.05;
    const cpfPayableForDownpayment = totalDownpayment - cashMinimumForDownpayment;
    actualCpfUsed = Math.min(cpfPayableForDownpayment, cpfSavings);
    const cashForDownpaymentShortfall = cpfPayableForDownpayment - actualCpfUsed;
    totalCashForDownpayment = cashMinimumForDownpayment + cashForDownpaymentShortfall;
  } else { // HDB
    actualCpfUsed = Math.min(totalDownpayment, cpfSavings);
    totalCashForDownpayment = totalDownpayment - actualCpfUsed;
  }

  // 5. Calculate Total Upfront Cash Required
  const legalFees = 3000;
  const totalUpfrontCashRequired = totalCashForDownpayment + stampDuties.total + legalFees;
  const totalInitialOutlay = totalUpfrontCashRequired + actualCpfUsed;
  
  // 6. Check for Affordability Shortfall
  let shortfallWarning = null;
  if (cashSavings < totalUpfrontCashRequired) {
    shortfallWarning = `Your cash savings of ${formatCurrency(cashSavings)} are insufficient for the required total upfront cash of ${formatCurrency(totalUpfrontCashRequired)}. You have a shortfall of ${formatCurrency(totalUpfrontCashRequired - cashSavings)}.`;
  }

  // 7. Renovation cost (for reference, not upfront purchase cost)
  let renovation = 50000; // Default for HDB
  if (propertyType === 'condo' || propertyType === 'ec') renovation = 80000;
  else if (propertyType === 'landed') renovation = 120000;

  return {
    loanAmount: maxLoan,
    ltvLoanLimit,
    totalDownpayment,
    totalCashForDownpayment,
    actualCpfUsed,
    legalFees,
    totalUpfrontCashRequired,
    totalInitialOutlay,
    renovation,
    shortfallWarning
  };
};

export const checkGrantEligibility = (data) => {
  const grants = [];
  const { citizenship, isFirstTime, annualIncome, propertyType } = data;

  // Grants are generally for Singapore Citizens.
  if (citizenship !== 'citizen') {
    return ['Grants are generally not applicable for non-citizens.'];
  }

  switch (propertyType) {
    case 'hdb':
      grants.push('Enhanced Housing Grant (EHG): May be available for first-timer families with a monthly household income up to S$9,000.');
      grants.push('Family Grant: May be available for first-timer families buying a resale flat.');
      grants.push('Proximity Housing Grant (PHG): May be available when buying a resale flat to live with or near parents/children.');
      break;

    case 'ec':
      grants.push('For New ECs: You may be eligible for the Family Grant and Proximity Housing Grant (PHG) if you meet the criteria.');
      grants.push('For Resale ECs (after 5-year MOP): CPF housing grants are not available.');
      break;
    
    case 'condo':
    case 'landed':
      grants.push('Not Applicable. CPF housing grants are not available for private properties.');
      break;
      
    default:
      // No property type selected.
      break;
  }
  
  if (grants.length === 0 && propertyType) {
       grants.push('Based on your profile, no specific grants were identified. Please check the HDB website for full eligibility criteria.');
  }

  return grants;
};
