import { useState } from 'react';
import { MapPin, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';

export default function PincodeChecker() {
  const [pincode, setPincode] = useState('');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!/^\d{6}$/.test(pincode)) return;
    setLoading(true);
    try {
      const res = await api.get(`/shipping/check/${pincode}`);
      setResult(res.data.data);
    } catch { setResult({ serviceable: false }); }
    finally { setLoading(false); }
  };

  return (
    <div className="border p-4 space-y-3">
      <p className="text-sm font-medium flex items-center gap-2"><MapPin size={16} className="text-brand-primary"/> Check Delivery</p>
      <div className="flex gap-2">
        <input type="text" maxLength={6} value={pincode} onChange={e => { setPincode(e.target.value); setResult(null); }}
          placeholder="Enter pincode"
          className="border px-3 py-2 text-sm flex-1 outline-none focus:border-brand-primary" />
        <button onClick={check} disabled={loading || pincode.length !== 6}
          className="bg-brand-primary text-white px-4 py-2 text-sm disabled:opacity-50">
          {loading ? '...' : 'Check'}
        </button>
      </div>
      {result && (
        <div className={`flex items-center gap-2 text-sm ${result.serviceable ? 'text-brand-success' : 'text-brand-error'}`}>
          {result.serviceable ? <CheckCircle size={16}/> : <XCircle size={16}/>}
          {result.serviceable
            ? `Delivery in ${result.estimated_days} days. ${result.free_above ? `Free above ₹${result.free_above}` : `₹${result.flat_rate} shipping`}`
            : 'Delivery not available'}
        </div>
      )}
    </div>
  );
}
