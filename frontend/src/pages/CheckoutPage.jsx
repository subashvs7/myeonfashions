import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { addressApi } from '../api/address';
import { ordersApi } from '../api/orders';
import { paymentApi } from '../api/payment';
import { configApi } from '../api/config';
import { useCartStore } from '../stores/cartStore';
import StepIndicator from '../components/checkout/StepIndicator';
import AddressCard from '../components/checkout/AddressCard';
import AddressForm from '../components/checkout/AddressForm';
import OrderSummaryPanel from '../components/checkout/OrderSummaryPanel';
import Button from '../components/ui/Button';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Payment', 'Confirm'];

export default function CheckoutPage() {
  const [step, setStep]             = useState(0);
  const [selectedAddressId, setSA]  = useState(null);
  const [paymentMethod, setPM]      = useState('razorpay');
  const [showAddForm, setShowForm]  = useState(false);
  const navigate                    = useNavigate();
  const { clearCart }               = useCartStore();

  const { data: addresses, refetch } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.getAll().then(r => r.data.data),
  });

  const { data: config } = useQuery({
    queryKey: ['public-config'],
    queryFn: () => configApi.get().then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const onlineEnabled = config?.['payment.online_enabled'] !== '0';
  const codEnabled    = config?.['payment.cod_enabled'] === '1';

  // Build available methods dynamically
  const paymentMethods = [
    onlineEnabled && { value: 'razorpay', label: 'Pay Online (UPI, Card, Net Banking)', desc: 'Secured by Razorpay' },
    codEnabled    && { value: 'cod',      label: 'Cash on Delivery',                    desc: 'Pay when your order arrives' },
  ].filter(Boolean);

  // Reset to first available method when config loads
  useEffect(() => {
    if (paymentMethods.length && !paymentMethods.find(m => m.value === paymentMethod)) {
      setPM(paymentMethods[0].value);
    }
  }, [config]);

  useEffect(() => {
    if (addresses?.length && !selectedAddressId) {
      setSA(addresses.find(a => a.is_default)?.id || addresses[0]?.id);
    }
  }, [addresses]);

  const { mutate: createOrder, isPending: creating } = useMutation({
    mutationFn: (data) => ordersApi.create(data),
    onSuccess: async (res) => {
      const order = res.data.data;
      if (paymentMethod === 'cod') {
        clearCart();
        navigate(`/order-success/${order.id}`);
        return;
      }
      // Razorpay
      try {
        const rzpRes = await paymentApi.createOrder(order.id);
        const rzpData = rzpRes.data.data;
        const options = {
          key:          rzpData.key,
          amount:       rzpData.amount,
          currency:     'INR',
          name:         'Myeon Casuals',
          description:  `Order ${rzpData.order_number}`,
          order_id:     rzpData.razorpay_order_id,
          handler:      async (response) => {
            try {
              await paymentApi.verify({ ...response, order_id: order.id });
              clearCart();
              navigate(`/order-success/${order.id}`);
            } catch {
              toast.error('Payment verification failed. Contact support with your order number.');
            }
          },
          prefill:      { name: 'Customer', email: '' },
          theme:        { color: '#2D1B69' },
          modal:        { ondismiss: () => toast.error('Payment cancelled. You can retry from your orders page.') },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        const isNetwork = !err.response;
        if (isNetwork) {
          toast.error('Network changed during payment setup. Your order is saved — retry payment from My Orders.');
        } else {
          toast.error(err.response?.data?.message || 'Payment initialization failed. Please try again.');
        }
        // Order was created — navigate so the user can retry payment from their order
        clearCart();
        navigate(`/order-success/${order.id}`);
      }
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Order failed'),
  });

  const handlePlaceOrder = () => {
    if (!selectedAddressId) return toast.error('Select a delivery address');
    createOrder({ address_id: selectedAddressId, payment_method: paymentMethod });
  };

  return (
    <div className="page-container py-8">
      <h1 className="font-heading text-3xl font-bold text-brand-primary mb-6">Checkout</h1>
      <StepIndicator steps={STEPS} currentStep={step} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Address Step */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-semibold">Select Delivery Address</h2>
              {addresses?.map(addr => (
                <AddressCard key={addr.id} address={addr} selected={selectedAddressId === addr.id}
                  onSelect={(a) => setSA(a.id)} />
              ))}
              {showAddForm ? (
                <div className="border p-4">
                  <AddressForm onSuccess={() => { setShowForm(false); refetch(); }} onCancel={() => setShowForm(false)} />
                </div>
              ) : (
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-sm text-brand-primary hover:underline">
                  <Plus size={16}/> Add New Address
                </button>
              )}
              <Button onClick={() => setStep(1)} disabled={!selectedAddressId}>Continue to Payment</Button>
            </div>
          )}

          {/* Payment Step */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-semibold">Payment Method</h2>
              {paymentMethods.map(m => (
                <label key={m.value} className={`flex gap-3 border p-4 cursor-pointer ${paymentMethod === m.value ? 'border-brand-primary bg-brand-primary/5' : ''}`}>
                  <input type="radio" value={m.value} checked={paymentMethod === m.value} onChange={() => setPM(m.value)} className="mt-1 accent-brand-primary" />
                  <div>
                    <p className="font-medium text-sm">{m.label}</p>
                    <p className="text-xs text-gray-500">{m.desc}</p>
                  </div>
                </label>
              ))}
              {paymentMethods.length === 0 && (
                <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  No payment methods are currently available. Please try again later.
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                <Button onClick={() => setStep(2)}>Review Order</Button>
              </div>
            </div>
          )}

          {/* Confirm Step */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-semibold">Review & Place Order</h2>
              {addresses?.find(a => a.id === selectedAddressId) && (
                <AddressCard address={addresses.find(a => a.id === selectedAddressId)} selectable={false} />
              )}
              <div className="border p-4 text-sm">
                <p className="font-medium">Payment: {paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handlePlaceOrder} loading={creating}>
                  {paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Pay'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <OrderSummaryPanel />
      </div>
    </div>
  );
}
