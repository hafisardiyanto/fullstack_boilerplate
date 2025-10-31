<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\RegistrationNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\UserResource;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email'=> 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|in:user,admin',
            'admin_code' => 'nullable|string'
        ];

        $data = $request->validate($rules);

        $role = $data['role'] ?? 'user';

        if ($role === 'admin') {
            // allow admin only if there is NO admin yet
            $exists = User::where('role', 'admin')->exists();

            if ($exists) {
                // if an admin already exists, allow only if ADMIN_REG_CODE is set and matches provided code
                $expected = env('ADMIN_REG_CODE', null);

                if (is_null($expected)) {
                    // no admin code configured -> reject
                    return response()->json([
                        'message' => 'Pendaftaran admin tidak diizinkan: admin sudah terdaftar. Hubungi admin untuk menambahkan akun baru.'
                    ], 403);
                }

                // compare codes in a timing-safe way
                if (! hash_equals((string)$expected, (string)($data['admin_code'] ?? ''))) {
                    return response()->json(['message' => 'Admin code tidak valid'], 403);
                }

                // else admin_code matches -> allow creating another admin
            }
            // else: no admin exists -> allow creating first admin w/o admin_code
        }

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $data['name'],
                'email'=> $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $role,
            ]);

            event(new Registered($user));

            try {
                Mail::to($user->email)->queue(new RegistrationNotification($user));
            } catch (\Exception $mailEx) {
                Log::error('Failed to queue registration email for user '.$user->id.': '.$mailEx->getMessage());
            }

            DB::commit();

            if (class_exists(UserResource::class)) {
                return (new UserResource($user))->response()->setStatusCode(201);
            }

            $user->makeHidden(['password']);
            return response()->json(['message' => 'Registered', 'data' => $user], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('RegisterController@register error: '.$e->getMessage());
            return response()->json(['message' => 'Registration failed'], 500);
        }
    }
}
