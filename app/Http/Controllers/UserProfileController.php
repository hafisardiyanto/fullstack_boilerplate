<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserProfileController extends Controller
{
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'name'=>'sometimes|required|string|max:255',
            'phone'=>'nullable|string',
        ]);
        $user->fill($data);
        $user->save();
        return response()->json(['message'=>'Profile updated','data'=>$user]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password'=>'required|string',
            'password'=>'required|string|min:8|confirmed'
        ]);

        $user = $request->user();
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message'=>'Current password incorrect'], 422);
        }
        $user->password = Hash::make($request->password);
        $user->save();
        return response()->json(['message'=>'Password updated']);
    }
}
