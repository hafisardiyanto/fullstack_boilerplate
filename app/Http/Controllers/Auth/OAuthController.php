<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\RegistrationNotification;

class OAuthController extends Controller
{
    // Redirect to Google
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    // Callback
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect(config('app.frontend_url') . '/login?error=oauth_failed');
        }

        // cari user berdasarkan email
        $user = User::where('email', $googleUser->getEmail())->first();

        if (!$user) {
            // buat user baru
            $user = User::create([
                'name' => $googleUser->getName() ?: $googleUser->getNickname() ?: 'No Name',
                'email' => $googleUser->getEmail(),
                'password' => null,
                'email_verified_at' => now(),
            ]);
            // kirim notifikasi registrasi
            Mail::to($user->email)->send(new RegistrationNotification($user));
        }

        // sekarang lakukan login (session cookie). Karena React frontend memerlukan cookie-based Sanctum,
        // kita biasanya redirect ke frontend dengan cookie sudah diset. Tetapi Socialite login di server-side:
        Auth::login($user);

        // Redirect ke frontend (React) misal:
        return redirect(config('app.frontend_url') . '/auth/oauth-success');
    }
}
