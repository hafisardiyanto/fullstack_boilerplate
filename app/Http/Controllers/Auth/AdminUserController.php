<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\RegistrationNotification;

class AdminUserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function store(Request $request)
    {
        $auth = $request->user();
        if (!$auth || $auth->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,user',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email'=> $data['email'],
            'phone'=> $data['phone'] ?? null,
            'password'=> Hash::make($data['password']),
            'role' => $data['role'],
        ]);

        Mail::to($user->email)->send(new RegistrationNotification($user));

        return response()->json([
            'status' => 'success',
            'data' => $user,
            'message' => 'buat user.'
        ], 201);
    }
}
