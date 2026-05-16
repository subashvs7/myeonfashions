import { useState } from 'react';
import { motion } from 'framer-motion';

const SIZES = {
  tops: {
    label: 'Tops, Kurtas & Blouses',
    headers: ['Size', 'Chest (cm)', 'Waist (cm)', 'Hip (cm)', 'Shoulder (cm)', 'Length (cm)'],
    rows: [
      ['XS', '76–80',  '60–64',  '84–88',  '35', '52'],
      ['S',  '80–84',  '64–68',  '88–92',  '36', '54'],
      ['M',  '84–88',  '68–72',  '92–96',  '37', '56'],
      ['L',  '88–92',  '72–76',  '96–100', '38', '58'],
      ['XL', '92–96',  '76–80',  '100–104','39', '60'],
      ['2XL','96–100', '80–84',  '104–108','40', '62'],
      ['3XL','100–104','84–88',  '108–112','41', '64'],
    ],
  },
  bottoms: {
    label: 'Lehengas, Skirts & Palazzos',
    headers: ['Size', 'Waist (cm)', 'Hip (cm)', 'Length (cm)'],
    rows: [
      ['XS', '60–64',  '84–88',  '96'],
      ['S',  '64–68',  '88–92',  '98'],
      ['M',  '68–72',  '92–96',  '100'],
      ['L',  '72–76',  '96–100', '102'],
      ['XL', '76–80',  '100–104','104'],
      ['2XL','80–84',  '104–108','106'],
      ['3XL','84–88',  '108–112','108'],
    ],
  },
  sarees: {
    label: 'Sarees (Standard)',
    headers: ['Type', 'Length', 'Width', 'Blouse Piece'],
    rows: [
      ['Standard Saree',  '5.5 m', '1.2 m', 'Included (0.8 m)'],
      ['Silk / Banarasi', '6.0 m', '1.2 m', 'Included (0.8 m)'],
      ['Half Saree',      '3.5 m', '1.2 m', 'Included'],
    ],
  },
};

const tips = [
  { label: 'Chest / Bust', desc: 'Measure around the fullest part of your chest, keeping the tape parallel to the ground.' },
  { label: 'Waist', desc: 'Measure around your natural waistline, the narrowest part of your torso.' },
  { label: 'Hip', desc: 'Stand with feet together and measure around the fullest part of your hips.' },
  { label: 'Shoulder', desc: 'Measure from the tip of one shoulder across to the tip of the other.' },
];

export default function SizeGuidePage() {
  const [tab, setTab] = useState('tops');
  const current = SIZES[tab];

  return (
    <div className="page-container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl font-bold text-brand-primary mb-3">Size Guide</h1>
          <p className="text-gray-500 max-w-md mx-auto">All measurements are in centimetres. If you're between sizes, we recommend sizing up for comfort.</p>
        </div>

        {/* How to measure */}
        <div className="bg-brand-bg border p-6 mb-10">
          <h2 className="font-heading text-lg font-bold text-brand-primary mb-4">How to Measure</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tips.map(t => (
              <div key={t.label} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-accent mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b mb-6">
          {Object.entries(SIZES).map(([key, val]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {val.label.split('(')[0].trim()}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-brand-primary text-white">
                {current.headers.map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {current.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-brand-bg'}>
                  {row.map((cell, j) => (
                    <td key={j} className={`px-4 py-3 border-b text-sm ${j === 0 ? 'font-semibold text-brand-primary' : 'text-gray-700'}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 text-xs text-amber-700">
          <strong>Note:</strong> Measurements may vary slightly by ±1–2 cm due to fabric type and construction. When in doubt, refer to the size chart on the individual product page or <a href="/contact" className="underline">contact us</a> for personalised guidance.
        </div>
      </motion.div>
    </div>
  );
}
