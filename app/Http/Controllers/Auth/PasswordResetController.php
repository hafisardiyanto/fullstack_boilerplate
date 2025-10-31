<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;

class PasswordResetController extends Controller
{
    // POST /api/forgot-password
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // sendResetLink returns a status string
        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'If that email exists, a password reset link has been sent.']);
        }

        // Return generic message on failure (avoid leaking which emails exist)
        return response()->json(['message' => 'Unable to send reset link.'], 400);
    }

    // POST /api/reset-password
    public function reset(Request $request)
    {
        $data = $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset(
            $data,
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(\Str::random(60));
                $user->save();
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password reset successful.']);
        }

        return response()->json(['message' => __($status)], 400);
    }
}
