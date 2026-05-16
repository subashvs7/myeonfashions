import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressApi } from '../../api/address';
import AddressForm from '../../components/checkout/AddressForm';
import Button from '../../components/ui/Button';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyAddresses() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.getAll().then(r => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => addressApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['addresses']); toast.success('Address removed'); },
    onError: () => toast.error('Failed to remove address'),
  });

  const defaultMutation = useMutation({
    mutationFn: (id) => addressApi.setDefault(id),
    onSuccess: () => { qc.invalidateQueries(['addresses']); toast.success('Default address updated'); },
  });

  const onSuccess = () => {
    setEditing(null);
    setAdding(false);
  };

  if (isLoading) return <div className="h-48 bg-gray-100 animate-pulse" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-brand-primary">My Addresses</h2>
        {!adding && !editing && (
          <Button variant="outline" onClick={() => setAdding(true)} className="flex items-center gap-2">
            <Plus size={16} /> Add New
          </Button>
        )}
      </div>

      {(adding || editing) && (
        <div className="border p-5 mb-6">
          <h3 className="font-medium mb-4">{editing ? 'Edit Address' : 'New Address'}</h3>
          <AddressForm
            defaultValues={editing || undefined}
            onSuccess={onSuccess}
            onCancel={() => { setEditing(null); setAdding(false); }}
          />
        </div>
      )}

      {!addresses.length ? (
        <div className="text-center py-12 text-gray-500 border">
          <p className="mb-4">No addresses saved yet.</p>
          <Button onClick={() => setAdding(true)}>Add Address</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`border p-4 relative ${addr.is_default ? 'border-brand-primary' : ''}`}>
              {addr.is_default && (
                <span className="absolute top-3 right-3 text-xs text-brand-primary font-medium flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> Default
                </span>
              )}
              <p className="font-medium text-sm">{addr.full_name}</p>
              <p className="text-sm text-gray-600">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
              <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
              <p className="text-sm text-gray-600">{addr.phone}</p>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                <button onClick={() => setEditing(addr)} className="text-xs text-brand-secondary hover:underline flex items-center gap-1">
                  <Edit2 size={12} /> Edit
                </button>
                {!addr.is_default && (
                  <>
                    <button onClick={() => defaultMutation.mutate(addr.id)} className="text-xs text-gray-500 hover:underline">
                      Set Default
                    </button>
                    <button onClick={() => deleteMutation.mutate(addr.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1 ml-auto">
                      <Trash2 size={12} /> Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
