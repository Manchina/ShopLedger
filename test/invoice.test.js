const test = require('node:test');
const assert = require('node:assert/strict');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function line(id, sku, name, price, qty, hsn, gstRate) {
  return { id, sku, name, price, qty, hsn, gstRate };
}

function checkOrder(order, expectedInvoice, expectedPricing) {
  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const pricingTotals = pricing.computeTotals(order.items, order.coupon);

  assert.deepStrictEqual({
    subtotal: invoiceFigures.subtotal,
    discount: invoiceFigures.discount,
    tax: invoiceFigures.tax,
    cgst: invoiceFigures.cgst,
    sgst: invoiceFigures.sgst,
    total: invoiceFigures.total,
    gstPercents: invoiceFigures.rows.map((row) => row.gstPercent),
    lineTaxes: invoiceFigures.rows.map((row) => row.lineTax)
  }, expectedInvoice);

  assert.deepStrictEqual({
    subtotal: pricingTotals.subtotal,
    discount: pricingTotals.discount,
    tax: pricingTotals.tax,
    cgst: pricingTotals.cgst,
    sgst: pricingTotals.sgst,
    total: pricingTotals.total
  }, expectedPricing);
}

test('CURRENT BEHAVIOUR: invoice uses supplied 5% and 12% gstRate values for #1001', () => {
  checkOrder({
    id: 1001,
    coupon: '',
    items: [
      line(1, 'GRN-001', 'Rice', 640, 1, '1006', 5),
      line(6, 'DRY-001', 'Ghee', 450, 1, '0405', 12)
    ]
  }, {
    subtotal: 1090,
    discount: 0,
    tax: 86,
    cgst: 43,
    sgst: 43,
    total: 1176,
    gstPercents: [5, 12],
    lineTaxes: [32, 54]
  }, {
    subtotal: 1090,
    discount: 0,
    tax: 86,
    cgst: 43,
    sgst: 43,
    total: 1176
  });
});

test('CURRENT BEHAVIOUR: SAVE10 invoice applies the capped discount before GST for #1002', () => {
  checkOrder({
    id: 1002,
    coupon: 'SAVE10',
    items: [
      line(1, 'GRN-001', 'Rice', 640, 1, '1006', 5),
      line(4, 'OIL-001', 'Sunflower oil', 190, 2, '1512', 5)
    ]
  }, {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9,
    gstPercents: [5, 5],
    lineTaxes: [28.8, 17.1]
  }, {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9
  });
});

test('CURRENT BEHAVIOUR: SAVE10 invoice applies the 150 discount cap before GST for #1004', () => {
  checkOrder({
    id: 1004,
    coupon: 'SAVE10',
    items: [
      line(5, 'OIL-002', 'Groundnut oil', 1120, 2, '1508', 5)
    ]
  }, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    gstPercents: [5],
    lineTaxes: [104.5]
  }, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5
  });
});

test('CURRENT BEHAVIOUR: invoice and checkout agree for all-18% no-coupon #1008', () => {
  checkOrder({
    id: 1008,
    coupon: '',
    items: [
      line(8, 'BEV-001', 'Packaged tea', 140, 1, '0902', 18),
      line(12, 'BEV-003', 'Kokum concentrate', 180, 2, '2106', 18)
    ]
  }, {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    gstPercents: [18, 18],
    lineTaxes: [25.2, 64.8]
  }, {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590
  });
});

test('CORRECT BEHAVIOUR: invoice matches checkout HSN GST and capped SAVE10 for #1004', () => {
  const order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      line(5, 'OIL-002', 'Groundnut oil', 1120, 2, '1508', 5)
    ]
  };
  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const checkout = pricing.computeTotals(order.items, order.coupon);

  assert.deepStrictEqual({
    subtotal: invoiceFigures.subtotal,
    discount: invoiceFigures.discount,
    tax: invoiceFigures.tax,
    total: invoiceFigures.total,
    gstPercents: invoiceFigures.rows.map((row) => row.gstPercent),
    lineTaxes: invoiceFigures.rows.map((row) => row.lineTax)
  }, {
    subtotal: checkout.subtotal,
    discount: checkout.discount,
    tax: checkout.tax,
    total: checkout.total,
    gstPercents: checkout.lines.map((row) => row.gstPercent),
    lineTaxes: checkout.lines.map((row) => row.tax)
  });
});
