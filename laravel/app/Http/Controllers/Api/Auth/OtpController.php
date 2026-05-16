<?php
namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class OtpController extends Controller
{
    public function send(Request $request)
    {
        $request->validate(['phone' => 'required|string|max:15']);
        $otp     = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expires = now()->addMinutes(10);

        User::where('phone', $request->phone)->update([
            'otp'            => $otp,
            'otp_expires_at' => $expires,
        ]);

        // In production: send SMS via Twilio/MSG91 etc.
        return response()->json(['success' => true, 'message' => 'OTP sent', 'debug_otp' => config('app.debug') ? $otp : null]);
    }

    public function verify(Request $request)
    {
        $request->validate(['phone' => 'required', 'otp' => 'required|string|size:6']);

        $user = User::where('phone', $request->phone)
                    ->where('otp', $request->otp)
                    ->where('otp_expires_at', '>', now())
                    ->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired OTP'], 422);
        }

        $user->update(['phone_verified_at' => now(), 'otp' => null, 'otp_expires_at' => null]);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['success' => true, 'data' => ['user' => $user, 'token' => $token]]);
    }
}
