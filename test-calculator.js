// Test for calculator functionality
console.log('Testing calculator functionality...');

// Mock DOM elements for testing (checkboxes instead of <select>)
const mockServiceCheckboxes = [
  { checked: true, value: 'reparacion-basica', dataset: { price: '500' }, label: 'Reparación Básica' },
  { checked: true, value: 'upgrade-ram', dataset: { price: '800' }, label: 'Upgrade de RAM' },
  { checked: false, value: 'mantenimiento', dataset: { price: '300' }, label: 'Mantenimiento' }
];

const mockUrgencySelect = {
  value: 'urgent',
  selectedOptions: [{ dataset: { multiplier: '1.5' } }]
};

const mockWarrantySelect = {
  value: '90',
  selectedOptions: [{ dataset: { price: '200' } }]
};

// Test calculatePrice function logic
function testCalculatePrice() {
  const selected = mockServiceCheckboxes.filter(cb => cb.checked);
  const basePrice = selected.reduce((total, cb) => {
    return total + parseFloat(cb.dataset.price || 0);
  }, 0);

  const urgencyMultiplier = parseFloat(mockUrgencySelect.selectedOptions[0].dataset.multiplier || 1);
  const warrantyPrice = parseFloat(mockWarrantySelect.selectedOptions[0].dataset.price || 0);

  const urgencyPrice = basePrice * (urgencyMultiplier - 1);
  const total = basePrice + urgencyPrice + warrantyPrice;

  console.log('Base price:', basePrice); // Should be 1300
  console.log('Urgency price:', urgencyPrice); // Should be 650
  console.log('Warranty price:', warrantyPrice); // Should be 200
  console.log('Total:', total); // Should be 2150

  return { basePrice, urgencyPrice, warrantyPrice, total };
}

const result = testCalculatePrice();
console.log('Test result:', result);

// Verify calculations
const expected = { basePrice: 1300, urgencyPrice: 650, warrantyPrice: 200, total: 2150 };
const passed = result.basePrice === expected.basePrice &&
              result.urgencyPrice === expected.urgencyPrice &&
              result.warrantyPrice === expected.warrantyPrice &&
              result.total === expected.total;

console.log('Test passed:', passed);