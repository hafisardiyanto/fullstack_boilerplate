<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function login(Request $request)
{
    try {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email atau password salah'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['message' => 'Login sukses',
    'user'=>[
    'id' => $user->id,
    'name' => $user->name,
    'email' => $user->email,
    'role' => $user->role,
    ],
    'token'=>$token
    ]);
    
    } catch (\Throwable $e) {
        \Log::error('Login error: '.$e->getMessage().' at '.$e->getFile().' : '.$e->getLine());
        return response()->json(['message'=>'Server error — lihat log untuk detail'], 500);
    }

}
}
