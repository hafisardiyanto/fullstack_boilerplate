<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\RegistrationNotification;

class OAuthController extends Controller
{
    // 1) Redirect user to Google consent screen
    public function redirectToGoogle()
    {
        // if you want stateless (no session): Socialite::driver('google')->stateless()->redirect();
        return Socialite::driver('google')->redirect();
    }

    // 2) Handle Google callback
    public function handleGoogleCallback()
    {
        try {
            // stateless() is usually safer for API flows (no session)
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            Log::error('Google OAuth failed: '.$e->getMessage());
            return redirect(config('app.frontend_url') . '/login?error=oauth_failed');
        }

        // find or create user
        $user = User::where('email', $googleUser->getEmail())->first();

        if (!$user) {
            $user = User::create([
                'name' => $googleUser->getName() ?: $googleUser->getNickname() ?: 'No Name',
                'email' => $googleUser->getEmail(),
                'password' => null,
                'email_verified_at' => now(),
                'google_id' => $googleUser->getId(),
                'role' => 'user',
            ]);

            try {
                Mail::to($user->email)->send(new RegistrationNotification($user));
            } catch (\Exception $mailEx) {
                Log::warning('Failed to send registration email: '.$mailEx->getMessage());
            }
        } else {
            // update google_id if missing
            if (empty($user->google_id)) {
                $user->google_id = $googleUser->getId();
                $user->save();
            }
        }

        // create sanctum/personal access token
        $token = $user->createToken('google_login')->plainTextToken;

        // Redirect back to frontend with token (and optionally role)
        $frontend = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));
        $redirectUrl = $frontend . '/auth/oauth-success?token=' . $token . '&role=' . $user->role;

        return redirect($redirectUrl);
    }
}
