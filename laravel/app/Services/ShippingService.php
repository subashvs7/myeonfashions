<?php
namespace App\Services;

use App\Models\ShippingZone;

class ShippingService
{
    public function calculate(string $pincode, float $orderTotal): float
    {
        $zone = $this->findZone($pincode);
        if (!$zone) return 99;

        if ($zone->free_above && $orderTotal >= $zone->free_above) return 0;
        return (float) $zone->flat_rate;
    }

    public function checkPincode(string $pincode): array
    {
        $zone = $this->findZone($pincode);
        if (!$zone) {
            return ['serviceable' => false, 'message' => 'Delivery not available to this pincode'];
        }
        return [
            'serviceable'    => true,
            'estimated_days' => $zone->estimated_days,
            'flat_rate'      => $zone->flat_rate,
            'free_above'     => $zone->free_above,
        ];
    }

    private function findZone(string $pincode): ?ShippingZone
    {
        return ShippingZone::active()
            ->get()
            ->first(function ($zone) use ($pincode) {
                $pincodes = $zone->pincodes ?? [];
                return in_array($pincode, $pincodes);
            })
            ?? ShippingZone::active()->whereNull('pincodes')->first();
    }
}
