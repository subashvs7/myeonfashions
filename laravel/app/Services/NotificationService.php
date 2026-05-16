<?php
namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public function send(User $user, string $type, string $title, string $message, array $data = []): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'type'    => $type,
            'title'   => $title,
            'message' => $message,
            'data'    => $data,
        ]);
    }

    public function sendOrderNotification(User $user, string $orderNumber, string $status): void
    {
        $messages = [
            'confirmed'        => "Your order #{$orderNumber} has been confirmed!",
            'shipped'          => "Your order #{$orderNumber} has been shipped!",
            'out_for_delivery' => "Your order #{$orderNumber} is out for delivery!",
            'delivered'        => "Your order #{$orderNumber} has been delivered!",
            'cancelled'        => "Your order #{$orderNumber} has been cancelled.",
        ];

        if (isset($messages[$status])) {
            $this->send($user, 'order_update', 'Order Update', $messages[$status], [
                'order_number' => $orderNumber,
                'status'       => $status,
            ]);
        }
    }
}
