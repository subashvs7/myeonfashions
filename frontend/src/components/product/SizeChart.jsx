import Modal from '../ui/Modal';

const SIZE_DATA = [
  { size: 'XS', chest: '32', waist: '26', hip: '35' },
  { size: 'S',  chest: '34', waist: '28', hip: '37' },
  { size: 'M',  chest: '36', waist: '30', hip: '39' },
  { size: 'L',  chest: '38', waist: '32', hip: '41' },
  { size: 'XL', chest: '40', waist: '34', hip: '43' },
  { size: 'XXL',chest: '42', waist: '36', hip: '45' },
];

export default function SizeChart({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Size Guide" size="md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-primary text-white">
              {['Size', 'Chest (in)', 'Waist (in)', 'Hip (in)'].map(h => (
                <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZE_DATA.map((row, i) => (
              <tr key={row.size} className={i % 2 === 0 ? 'bg-brand-bg' : 'bg-white'}>
                <td className="px-4 py-2 font-medium">{row.size}</td>
                <td className="px-4 py-2">{row.chest}"</td>
                <td className="px-4 py-2">{row.waist}"</td>
                <td className="px-4 py-2">{row.hip}"</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-4">Measurements are approximate. For best fit, measure your actual body and add 1-2 inches.</p>
    </Modal>
  );
}
